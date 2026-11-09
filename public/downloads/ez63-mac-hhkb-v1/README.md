# EZ63 · Mac / HHKB v1.0

公开分享日期 / Published: 2026-11-09
官网临时配置码 / Temporary official import code: `7URSPMZB`

## 中文导入说明

这份配置针对 IQUNIX EZ63，导出时固件为 3.1.3，快捷键面向 macOS。

1. 先备份自己的键位、宏槽和灵动键设置。当前方案占用 M0–M6。
2. 用 Chrome 打开 https://ez.iqunix.com/，连接 EZ63，进入「我的配置 → 导入配置码」，输入上面的八位码。
3. 检查导入预览，选择希望使用的板载槽。配置码有时效，官网没有提供具体有效期。
4. 在「宏录制」里依照下表录入 M0–M6。每个宏选择「触发一次」和 50ms 标准间隔；按顺序按下组合，再倒序松开所有键。
5. 分别试用修饰键、方向键、符号输入、截图和宏，确认符合你的 Mac 设置。锁屏宏留到最后试。

公开配置码没有灯光与性能参数，不会把本机轴体型号和触发行程作为导入内容。官网生成的数据仍携带六组空的高级功能列表（rs/socd/dks/mt/tgl/lt）；如果你配置过 SOCD、DKS 等灵动键，请先备份，不能承诺应用后保留这些自定义项。

| 宏 | 按下顺序 | 功能 | 触发键 |
|---|---|---|---|
| M0 | 左 Command → Space | 默认启动器快捷键 | Fn+Space |
| M1 | 左 Command → 左 Shift → 4 | 区域截图 | Fn+P |
| M2 | 左 Command → 左 Shift → 5 | 截图/录屏工具栏 | Fn+O |
| M3 | 左 Control → 左 Command → Space | 表情与符号 | Fn+E |
| M4 | 左 Control → ↑ | Mission Control | Fn+W |
| M5 | 左 Command → 左 Option → 左 Shift → V | 粘贴并匹配样式，需应用支持 | Fn+V |
| M6 | 左 Control → 左 Command → Q | 锁屏 | Fn+Q |

主层：Caps Lock→Control；最左下角→Fn；底行 Fn / Option / Command / Space / Command / Option / ← / ↓ / →。Backspace、反斜杠、Enter、右 Shift 与独立方向键保留原位置。Fn+Esc 输入反引号，左 Shift+Fn+Esc 输入波浪号，左 Shift+反斜杠输入竖线。Fn 层的 ▿ 为透传原键。

作者的 Mac 另有 Karabiner 将右 Shift→F18、Control+H/J/K/L→方向键。这些规则不包含在键盘配置中，普通电脑导入后右 Shift 仍是右 Shift。Fn+Space 发送 Command+Space；它会调用你自己配置的 Spotlight/Alfred 等入口，而非自动安装或配置 Alfred。

JSON 和 CSV 是可长期保存、人工重建配置的资料，不是官网可直接导入的文件。临时码过期后，按 keymap.csv 和宏表逐项恢复；不提供永久有效或一键离线导入的承诺。官方导出请求和本地两层键位已核对一致，未在第二把键盘上执行导入测试。

## English import instructions

For IQUNIX EZ63; exported with firmware 3.1.3. The shortcuts target macOS.

1. Back up your keymap, macros and advanced key functions. This layout uses macro slots M0–M6.
2. Open https://ez.iqunix.com/ in Chrome and connect the EZ63. Under My Profiles, choose Import Configuration Code and enter `7URSPMZB`.
3. Inspect the imported profile and select the intended onboard slot. The code is temporary; IQUNIX does not display an exact expiry time.
4. Record M0–M6 using the table above: Command, Shift, Option and Control are the left modifiers. Press keys in the listed order, then release in reverse order. Use single execution and fixed 50ms intervals.
5. Test keys and shortcuts on your Mac. The JSON includes all exact macro actions, but cannot be imported directly through the official code field.

The official code omits lighting and performance. It still contains empty advanced-function lists for rs/socd/dks/mt/tgl/lt, which may replace your custom advanced functions. The code carries macro key bindings, not macro actions; record the seven macros separately.

M0: launcher (Cmd+Space); M1: area screenshot; M2: screenshot toolbar; M3: emoji; M4: Mission Control; M5: paste and match style (application-dependent); M6: lock screen.

The author's Karabiner rules (right Shift→F18 and Control+H/J/K/L→arrows) are not included. Right Shift remains right Shift without those rules. Cmd+Space follows your Mac's launcher assignment; Alfred is not installed or configured by this profile.

JSON and CSV provide a permanent reference for manual reconstruction after the temporary code expires. They are not official import files. The exported keymap was compared against the saved layout; importing into a second keyboard was not tested.
