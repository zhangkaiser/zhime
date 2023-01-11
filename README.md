# zhime
Chrome OS IME, Browser Extension IME UI, VScode Simple IME.

当前状态支持[librime-wasm](https://github.com/zhangkaiser/librime-wasm)和[shuangpin](https://github.com/zhangkaiser/chromeos-shuangpin-ime)两种解析方案。

两种解析方案各有优势
－ `librime-wasm`比较灵活，支持自由的配置方式，并且可以使用网上很不不同的输入解析方案和自定义交互方式。（弊端：由于使用了一些外部库，迁移至WEB性能和内存带来了一些限制；需要用户学习RIME配置方式）。
- `shuangpin`是比较轻量级的，性能与内存占比都比较出众。（弊端：缺少用户定制功能。）


## 使用方式

当前`zhime` 为UI控制扩展，并与`解析库`进行交互。两者都需要提前安装并在`zhime`**选项页面**中添加`解析库的扩展ID`才能够正常使用。

- `压缩包`安装，下载`压缩包` >> [https://github.com/zhangkaiser/zhime/releases](https://github.com/zhangkaiser/zhime/releases)
- `自编译`，可分别克隆`不同库`进行编译。编译指令均可在`package.json`中查看到相应命令。


在`zhime`和`解析库`两者安装到插件上后，均可在`选项页面`进行管理相应的选项。
- 在`zhime`选项页面设置添加`解析库`的**扩展ID**。
- 在`解析库`选项页面上传部署解析方案／配置使用的输入法功能。

当前由于`配置选项`页面还比较简陋，功能、交互、描述等都不太清晰。如遇到使用上的困难，可以提交`issue`。
