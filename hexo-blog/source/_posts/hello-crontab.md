---
title: 每天学点linux命令之crontab
date: 2018-01-11 15:49:19
tags: 脚本
categories: linux
---

## crontab介绍
个人计划系列—-每天学点linux命令。部分内容来至[Github项目](https://github.com/me115/linuxtools_rst)。
### crontab作用
通过crontab 命令，我们可以在固定的间隔时间执行指定的系统指令或 shell script脚本。时间间隔的单位可以是分钟、小时、日、月、周及以上的任意组合。这个命令非常适合周期性的日志分析或数据备份等工作。
<!-- more -->
### crontab命令格式
>    crontab [-u user] file crontab [-u user] [ -e | -l | -r ]

### crontab命令参数
基本命令参数
* -u user：用来设定某个用户的crontab服务；
* file：file是命令文件的名字,表示将file做为crontab的任务列表文件并载入crontab。如果在命令行中没有指定这个文件，crontab命令将接受标准输入（键盘）上键入的命令，并将它们载入crontab。
* -e：编辑某个用户的crontab文件内容。如果不指定用户，则表示编辑当前用户的crontab文件。
* -l：显示某个用户的crontab文件内容，如果不指定用户，则表示显示当前用户的crontab文件内容。
* -r：从/var/spool/cron目录中删除某个用户的crontab文件，如果不指定用户，则默认删除当前用户的crontab文件。
* -i：在删除用户的crontab文件时给确认提示。

### crontab的文件格式
分 时 日 月 星期 要运行的命令

* 第1列分钟0～59
* 第2列小时0～23（0表示子夜）
* 第3列日1～31
* 第4列月1～12
* 第5列星期0～7（0和7表示星期天）
* 第6列要运行的命令

## crontab 使用

### 创建(修改)cron定时文件

```bash
    crontab -e
```
保存后 */var/spool/cron* 文件夹下回找到当前用户的定时任务
```bash
    crontab ** //对应文件就可以放入定时任务中
```

### 查看cron定时文件
```bash
    crontab -l
```
就会列举出cron文件中所有的定时任务

### 删除cron定时任务
```bash
    crontab -r
```
删除当前用户的定时任务

## crontab 实例

### 具体代码放一个code块
```bash
    #实例1：每1分钟执行一次myCommand
    * * * * * myCommand
    #实例2：每小时的第3和第15分钟执行
    3,15 * * * * myCommand
    #实例3：在上午8点到11点的第3和第15分钟执行
    3,15 8-11 * * * myCommand
    #实例4：每隔两天的上午8点到11点的第3和第15分钟执行
    3,15 8-11 */2  *  * myCommand
    #实例5：每周一上午8点到11点的第3和第15分钟执行
    3,15 8-11 * * 1 myCommand
    #实例6：每晚的21:30重启smb
    30 21 * * * /etc/init.d/smb restart
    #实例7：每月1、10、22日的4 : 45重启smb
    45 4 1,10,22 * * /etc/init.d/smb restart
    #实例8：每周六、周日的1 : 10重启smb
    10 1 * * 6,0 /etc/init.d/smb restart
    #实例9：每天18 : 00至23 : 00之间每隔30分钟重启smb
    0,30 18-23 * * * /etc/init.d/smb restart
    #实例10：每星期六的晚上11 : 00 pm重启smb
    0 23 * * 6 /etc/init.d/smb restart
    #实例11：每一小时重启smb
    * */1 * * * /etc/init.d/smb restart
    #实例12：晚上11点到早上7点之间，每隔一小时重启smb
    0 23-7 * * * /etc/init.d/smb restart
```
这些基本够用

## crontab 的坑
### 不能执行
有时我们创建了一个crontab，但是这个任务却无法自动执行，而手动执行这个任务却没有问题，这种情况一般是由于在crontab文件中没有配置环境变量引起的。
- 脚本中涉及文件路径时写全局路径；
- 脚本执行要用到java或其他环境变量时，通过source命令引入环境变量。
- 当手动执行脚本OK，但是crontab死活不执行时,很可能是环境变量惹的祸，可尝试在crontab中直接引入环境变量解决问题。
### 不生效
新创建的cron job，不会马上执行，至少要过2分钟才执行。如果重启cron则马上执行。

## crontab 日志

### 日志目录
    1.linux
    看 /var/log/cron这个文件就可以，可以用tail -f /var/log/cron观察(不能用cat查看)
    2.unix
    在 /var/spool/cron/tmp文件中，有croutXXX001864的tmp文件，tail 这些文件就可以看到正在执行的任务了。
    3.mail任务
    在 /var/spool/mail/root 文件中，有crontab执行日志的记录，用tail -f /var/spool/mail/root 即可查看最近的crontab执行情况。

### 增加任务日志
    增加任务日志输出就不详细表了，无非是 >> 和  2>&1 这一堆东西罢了。




