//按需引入echarts
import * as echarts from 'echarts/core'

// 引入图表
import {
    LineChart,
    PieChart
} from 'echarts/charts'

// 引入组件
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent
} from 'echarts/components'

// 渲染器
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
    LineChart, PieChart,
    TitleComponent, TooltipComponent, LegendComponent,
    GridComponent, DatasetComponent, TransformComponent,
    CanvasRenderer
])

export default echarts