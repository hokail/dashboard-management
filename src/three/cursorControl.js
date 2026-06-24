import * as THREE from 'three'

//获取某个模型的的父级group，可以指定targetName
function findParentGroup(object, targetName = null) {
    let current = object;

    // 从当前物体开始，不断向上查找父级
    while (current.parent) {
        // 如果父级是一个 Group
        if (current.parent.isGroup) {
            // 如果没有指定名称，直接返回这个 Group
            if (!targetName) {
                return current.parent;
            }
            // 如果指定了名称，检查名称是否匹配
            if (current.parent.name === targetName) {
                return current.parent;
            }
        }
        // 如果到达场景根节点 (Scene)，停止循环，防止死循环
        if (current.parent.isScene) {
            break;
        }
        // 继续向上
        current = current.parent;
    }
    return null;
}

class CursorControl {
    constructor(camera, renderer, scene, targetModels) {
        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;
        this.targetModels = targetModels;

        this.selectedModel = null;

        this.clickCallbacks = []


        this.init();
    }
    init() {
        //bind改变this指向，this指向CursorControl，否则指向点击的对象
        this.renderer.domElement.addEventListener('click', this.onClick.bind(this))
        this.renderer.domElement.addEventListener('contextmenu', this.onRightClick.bind(this))
        // this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
        // this.renderer.domElement.addEventListener('dblclick', this.onDoubleClick.bind(this))
    }
     onClick(event) {

        // --- 步骤一：坐标转换 ---
        // 获取鼠标点击位置的像素坐标
        // 使用 offsetX/offsetY 可以得到相对于 canvas 的坐标，更为准确[reference:16]
        const px = event.offsetX;
        const py = event.offsetY;

        // 获取 canvas 的宽高
        const width = this.renderer.domElement.clientWidth;
        const height = this.renderer.domElement.clientHeight;

        // 将屏幕坐标转换为标准化设备坐标 (NDC)
        // x 和 y 的范围在 -1 到 1 之间[reference:17][reference:18]
        const x = (px / width) * 2 - 1;
        const y = -(py / height) * 2 + 1;

        // --- 步骤二：发射射线 ---
        // 创建一个射线投射器实例
        const raycaster = new THREE.Raycaster();
        // 通过鼠标位置和相机，计算出射线
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

        // --- 步骤三：检测相交 ---
        // 检测射线与场景中所有物体的交点
        // 第二个参数 `true` 表示会递归检测模型组 (Group) 的子物体[reference:19][reference:20]
        const intersects = raycaster.intersectObjects(this.targetModels || this.scene, true);

        // 如果 intersects 数组不为空，说明点击到了模型
        if (intersects.length > 0) {
            // 获取第一个被点击到的模型对象,并通过findParentGroup找到最外层的group
            const target = findParentGroup(intersects[0].object)
            // 执行你的交互逻辑，例如改变颜色[reference:21][reference:22]
            this.highlightObject(target)
            if(this.clickCallbacks.length){
                this.clickCallbacks.forEach(cb => cb())
            }

        } else {
            if (this.selectedModel) {
                this.restoreObjectMaterial()
                this.selectedModel = null
            }
        }
    }

    onRightClick(event){
        if (this.selectedModel) {
            this.restoreObjectMaterial()
            this.selectedModel = null
        }
    }

    addClickCallbacks(callback) {
        this.clickCallbacks.push(callback)
    }

    removeClickCallbacks(callback) {
        let index = this.clickCallbacks.indexOf(callback)
        if(index !== -1) {
            this.clickCallbacks.splice(index, 1)
        }
    }

    highlightObject(target) {
        // 1. 取消上一次的高亮
        if (this.selectedModel) {
            this.restoreObjectMaterial(target);
        }

        // 2. 处理点击目标（如果是Group，则处理所有子Mesh；如果是Mesh直接处理）
        const meshes = [];
        if (target.isGroup) {
            target.children.forEach(child => {
                if (child.isMesh && child.name !== 'statusLight' )
                    meshes.push(child);
            });
        } else if (target.isMesh) {
            meshes.push(target);
        }

        // 3. 应用高亮效果
        meshes.forEach(mesh => {
            // 保存原始 emissive 颜色和强度，以便取消高亮时恢复
            mesh.userData.origEmissive = mesh.material.emissive.clone();
            mesh.userData.origEmissiveIntensity = mesh.material.emissiveIntensity;

            // 设置为亮眼的颜色（例如亮蓝色或橙色）
            mesh.material.emissive.setHex(0x00aaff);
            mesh.material.emissiveIntensity = 1;
        });

        // 4. 增加一个“浮起”或放大的效果（视觉上更突出）
        if (target.isGroup) {
            target.scale.set(1.1, 1.1, 1.1);
        } else {
            target.scale.set(1.1, 1.1, 1.1);
        }

        // 5. 存储当前高亮对象，并开启脉动动画
        this.selectedModel = target;
    }

    restoreObjectMaterial() {
        if(this.selectedModel){

            const meshes = [];
            if (this.selectedModel.isGroup) {
                this.selectedModel.children.forEach(child => {
                    if (child.isMesh && child.name !== 'statusLight' )
                        meshes.push(child);
                });
            } else if (this.selectedModel.isMesh) {
                meshes.push(this.selectedModel);
            }

            meshes.forEach(mesh => {
                mesh.material.emissive.copy(mesh.userData.origEmissive);
                mesh.material.emissiveIntensity = mesh.userData.origEmissiveIntensity;
            })


            if (this.selectedModel.isGroup) {
                this.selectedModel.scale.set(1, 1, 1);
            } else {
                this.selectedModel.scale.set(1, 1, 1);
            }

            this.selectedModel = null
        }

    }

    dispose() {
        this.renderer.domElement.removeEventListener('click', this.onClick.bind(this))
        this.renderer.domElement.removeEventListener('contextmenu', this.onRightClick.bind(this))
        // this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this))
        // this.renderer.domElement.removeEventListener('dblclick', this.onDoubleClick.bind(this))
    }

}

export default CursorControl