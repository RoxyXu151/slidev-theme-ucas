# 风格、布局与组件

## 主题配置

```yaml
---
theme: ucas
lang: zh-CN
themeConfig:
  style: minimal-blue
  footer: 中国科学院大学 · [学院或研究所]
  showPageNumber: true
---
```

在主题源码仓库里使用 `theme: ./`。配置可以放在全局 themeConfig 或单页 frontmatter，单页优先。`footer: false` 隐藏页脚，`showPageNumber: false` 隐藏页码。可覆盖 `primary`、`accent`。封面 metadata 来自当前页，不自动继承第一页。

## 八种风格

| style | 来源特点 | 常用场景 |
| --- | --- | --- |
| minimal-blue | 蓝色渐变、校园剪影 | 通用学术报告 |
| minimal-red | 红色渐变、校园剪影 | 工作汇报、政务主题 |
| minimal-green | 青绿渐变、校园剪影 | 课程、校园活动 |
| tech | 原模板科技蓝、顶部或侧边章节导航 | 答辩、组会 |
| diagonal | 校园照片、几何切分 | 项目、研究背景 |
| night | 校园夜景、深色底与橙色强调 | 夜景风格报告 |
| autumn | 金秋照片、棕橙配色 | 校园主题、课程展示 |
| sunset | 钟楼与秋叶、夕阳照片构图 | 人文与校园主题 |

在同一报告中通常只选一种全局风格。只在主题展示或用户要求时混用。

科技风导航示例，sections 顺序与当前 sectionIndex 对应，index 从 1 开始。这里的章节标签用于显示，目录跳转通过 toc 中的页码链接实现。

```yaml
style: tech
navigation: side
sections: ['研究背景', '研究方法', '实验分析', '总结展望']
sectionIndex: 2
```

`navigation: side` 仅对 tech 生效。省略 sections 时页眉显示 section。

## 布局插槽

| layout | 默认内容 | 命名插槽及字段 |
| --- | --- | --- |
| cover / end | 一级标题 | presenter、advisor、date、subtitle；image 可覆盖封面照片 |
| toc | 有序列表目录 | heading 可替换“目录”；链接用显式页码 `(5)` |
| section | 章节标题 | number、subtitle |
| default | 标题与普通正文 | section 可填页眉章节名 |
| two-cols / compare | 总标题 | `::left::` 与 `::right::`，可选 `::note::` |
| image-left / image-right | 正文 | `::title::` 放总标题，`image` 或 `::image::` 放图片 |
| figure | 总标题 | `image` 或 `::figure::` 放大图 |
| grid | 总标题 | `::first::`、`::second::`、`::third::`、`::fourth::`，可选 `::note::` |
| steps | 总标题 | `::first::`、`::second::`、`::third::`，可选 `::note::`，自动编号 |
| focus | 总标题 | `::focus::` 核心公式或数字、`::explanation::` 解释、可选 `::note::` |
| gallery | 总标题 | `::first::`、`::second::`、`::third::` 三组图文，可选 `::note::` |

图文与大图布局支持 caption、imageAlt、fit。科研图保持 `fit: contain`，只有装饰照片用 `cover`。图片在独立演示的 public 中，以 `/filename.png` 引用，部署子路径由主题处理。也可使用命名插槽导入本地图片。

## 双栏示例

```md
---
layout: compare
---

# 两种方法的差别

::left::

## 原有方法

[待补充：机制与局限]

::right::

## 本文方法

[待补充：改变与证据]
```

## 图文示例

```md
---
layout: image-left
image: /experiment.png
imageAlt: 实验平台结构
caption: '[待补充：来源]'
fit: contain
---

## 条件与观察

[待补充：图片不能直接表达的信息]

::title::

# 实验平台
```

## 组件

```vue
<UcasCallout title="主要发现">[待补充：有证据支持的结论]</UcasCallout>
<UcasCallout title="局限" tone="accent">[待补充：适用条件]</UcasCallout>
<UcasMetrics :items="[
  { value: '128', label: '样本量', detail: '演示数据' },
  { value: '86%', label: '指标示例', detail: '演示数据，非实验结果' }
]" />
<UcasTimeline :items="[
  { date: '第一阶段', title: '准备材料', description: '[待补充]' },
  { date: '第二阶段', title: '验证假设', description: '[待补充]' }
]" />
```

公式用 `$...$` 或 `$$...$$`。focus 的 explanation 可放一段解释，或三条带加粗短标题的列表；三条列表自动横向排列。复杂公式放完整宽度的 focus，不强行塞进双栏。数字组件建议 2–3 项，时间轴建议 3–5 项。数据与来源必须真实；上面的值只演示接口。
