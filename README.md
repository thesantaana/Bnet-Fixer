# Bnet-Fixer
One-click fix for Battle.net installation agent errors for cn server.


本工具旨在解决战网安装失败、卡更新、以及无法启动的问题（特别是错误代码 `BLZBNTBTS0000005D`）。它通过“清理残留”和“修复环境”两个维度进行深度修复。

**核心功能模块：**

1. **进程查杀 (Kill Processes)：**
   - 自动检测并强制结束所有暴雪相关的后台进程（包括 Agent.exe, Battle.net.exe 等），防止因文件被占用导致修复失败。
2. **深度缓存清理 (Deep Cache Clean)：**
   - 删除位于 `%ProgramData%`, `%AppData%`, `%LocalAppData%` 下的所有战网相关文件夹。
   - 清除注册表中相关的配置项。
   - *作用：解决因旧文件损坏、版本冲突导致的安装错误。*
3. **环境与服务修复 (Network & Service)：**
   - **开启 Secondary Logon 服务**：这是战网更新代理必须依赖的系统服务，脚本会自动将其设为“自动启动”。
   - **网络重置**：执行 DNS 刷新、Winsock 重置和 TCP/IP 重置。
   - *作用：解决连接服务器失败、更新卡住不动的问题。*
