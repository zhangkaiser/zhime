# ZHIME

已经脱坑chrome os
输入法替代品：[fydeRhythm](https://github.com/FydeOS/fydeRhythm)

适用于ChomreOS的一款中文输入法。

当前状态支持[librime-wasm](https://github.com/zhangkaiser/librime-wasm)和[shuangpin](https://github.com/zhangkaiser/chromeos-shuangpin-ime)两种解析方案。

两种解析方案各有优势
- `librime-wasm` 完全基于librime比较灵活，支持自由的配置方式，并且可以使用网上很不不同的输入解析方案和自定义交互方式。（弊端：由于使用了一些外部库，迁移至WEB性能和内存带来了一些限制；需要用户学习RIME配置方式）。
- `shuangpin`是比较轻量级的，性能与内存占比都比较出众。（弊端：缺少用户定制功能。）


## 项目进度说明

- 支持单线程操作（`Yes`）
  > 问题：`shuangpin中的用户词库+联想词`和`librime的leveldb库的后台线程`需要多线程支持 > 解决方法(`关闭多线程的操作`)。
- 支持多线程/Worker （`TODO`）
  > 问题：由于MV3的`background`无法支持worker的创建，只能使用mv2/在浏览器中打开一个页面来承载解析器
- 支持联想词（`TODO`）
- 完善的Wiki（`TODO`）
- 集成Rime（`Yes`）
- 集成Shuangpin（`Yes`）
- 可以自定义插件（`TODO`）

