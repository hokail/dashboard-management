import {register} from "@antv/x6-vue-shape";
import DeviceHistoryNode from "./DeviceHistoryNode.vue";
import { Graph, Shape  } from '@antv/x6'
function registerDeviceHistoryNode(){
    register({
        shape: 'device-history-node',
        width: 200,
        height: 250,
        component: DeviceHistoryNode,
        ports: {
            items: [
                {
                    id: 'bottom',
                    group: 'bottom',
                },
                {
                    id: 'left',
                    group: 'left',
                    args: {
                        dy: -100,
                    },
                },
                {
                    id: 'right',
                    group: 'right',
                    args: {
                        dy: -100,
                    },

                },
                {
                    id: 'top',
                    group: 'top',
                },
            ],
            groups: {
                top: {
                    position: 'top',
                    attrs: {
                        circle: {
                            magnet: true,
                            stroke: '#8f8f8f',
                            r: 8,
                            visibility: 'hidden',
                        },
                    },
                },
                bottom: {
                    position: 'bottom',
                    attrs: {
                        circle: {
                            magnet: true,
                            stroke: '#8f8f8f',
                            r: 8,
                            visibility: 'hidden',
                        },
                    },
                },
                left: {
                    position: 'left',
                    attrs: {
                        circle: {
                            magnet: true,
                            stroke: '#8f8f8f',
                            r: 8,
                            visibility: 'hidden',
                        },
                    },
                },
                right: {
                    position: 'right',
                    attrs: {
                        circle: {
                            magnet: true,
                            stroke: '#8f8f8f',
                            visibility: 'hidden',
                            r: 8,
                        },
                    },
                },
            },
        },
    })
    // ✅ 注册一个带默认 label 位置的边
    Graph.registerEdge('my-edge', {
        inherit: 'edge',   // 继承内置 edge
        attrs: {
            line: {
                stroke: '#d3d3d3',
                strokeWidth: 2,
                targetMarker: 'classic',
            },
        },
        // ★ fromJSON 还原边时，labels 会与 defaultLabel merge
        defaultLabel: {
            markup: [
                {
                    tagName: 'rect',
                    selector: 'body',
                },
                {
                    tagName: 'text',
                    selector: 'label',
                },
            ],
            attrs: {
                text: {
                    fill: '#000',
                    fontSize: 14,
                    textAnchor: 'middle',
                    textVerticalAnchor: 'middle',
                    pointerEvents: 'none',
                },
            },
            position: {
                distance: 0.5,     // 沿边 50%（可改 0.3 / 100px 等）
                offset: -18,       // 垂直偏移，负数为上方
                options: {
                    keepGradient: false,
                    ensureLegibility: true,
                },
            },
        },
    }, true)
    register({
        shape: 'end-node',
        inherit: 'rect', // 继承于 rect 节点
        width: 200,
        height: 250,
        markup: [
            {
                tagName: 'rect', // 标签名称
                selector: 'body', // 选择器
            }
        ],
        attrs: {
            body: {
                strokeWidth: 0,
                fill: 'rgba(255,255,255,0)',
            },
        },
        ports: {
            items: [
                {
                    id: 'bottom',
                    group: 'bottom',
                },
                {
                    id: 'left',
                    group: 'left',
                    args: {
                        dy: -100,
                    },
                },
                {
                    id: 'right',
                    group: 'right',
                    args: {
                        dy: -100,
                    },

                },
                {
                    id: 'top',
                    group: 'top',
                },
            ],
            groups: {
                top: {
                    position: 'top',
                    attrs: {
                        circle: {
                            magnet: true,
                            stroke: '#8f8f8f',
                            r: 8,
                            visibility: 'hidden',
                        },
                    },
                },
                bottom: {
                    position: 'bottom',
                    attrs: {
                        circle: {
                            magnet: true,
                            stroke: '#8f8f8f',
                            r: 8,
                            visibility: 'hidden',
                        },
                    },
                },
                left: {
                    position: 'left',
                    attrs: {
                        circle: {
                            magnet: true,
                            stroke: '#8f8f8f',
                            r: 8,
                            visibility: 'hidden',
                        },
                    },
                },
                right: {
                    position: 'right',
                    attrs: {
                        circle: {
                            magnet: true,
                            stroke: '#8f8f8f',
                            visibility: 'hidden',
                            r: 8,
                        },
                    },
                },
            },
        },
    })
}
export default registerDeviceHistoryNode;
