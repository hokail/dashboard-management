import {Graph} from "@antv/x6";
function registerCustomNode() {
    Graph.registerNode(
        'device-history-node',
        {
            inherit: 'rect', // 继承于 rect 节点
            width: 100,
            height: 40,
            markup: [
                {
                    tagName: 'rect', // 标签名称
                    selector: 'body', // 选择器
                },
                {
                    tagName: 'image',
                    selector: 'img',
                },
                {
                    tagName: 'text',
                    selector: 'label',
                },
            ],
            attrs: {
                body: {
                    stroke: '#8f8f8f',
                    strokeWidth: 1,
                    fill: '#fff',
                    rx: 6,
                    ry: 6,
                },
                img:{
                    width: 16,
                    height: 16,
                    x: 12,
                    y: 12,
                },
                label: {
                    text: 'Device History',
                    refX: '50%',
                    refY: '50%',
                    fontSize: 12,
                    fill: '#333',
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
                  },
                  {
                      id: 'right',
                      group: 'right',
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
            }

        },
        true,
    )
}

export {registerCustomNode};

