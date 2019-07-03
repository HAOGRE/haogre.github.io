---
title: 每天学点linux命令之help
date: 2017-02-15 15:49:19
tags: 脚本
categories: linux
---
个人计划系列----每天学点linux命令。部分内容来至[Github项目](https://github.com/me115/linuxtools_rst)。

linux有太多的命令，经常使用也有很多！每一条都要记住对自己的大脑的考验也很大，在此记录一下linux命令使用方法！学会使用help等命令就学会了大半的linux命令。
- 在只记得部分命令关键字的场合，我们可通过man -k来搜索；
- 需要知道某个命令的简要说明，可以使用whatis；而更详细的介绍，则可用info命令；
- 查看命令在哪个位置，我们需要使用which；
- 而对于命令的具体参数及使用方法，我们需要用到强大的man；

<!--more-->

#### 使用whatis命令
简要说明命令的作用（显示命令所处的man分类页面）
``` bash
    $whatis command
    eg:whatis iptables
```
正则匹配
``` bash
	$whatis -w "loca*"
```

#### 使用info命令
``` bash
	$info command  
	```
#### 使用man命令
查询命令command的说明文档
``` bash
	$man command
	eg：man date
```
在man的帮助手册中，将帮助文档分为了9个类别，对于有的关键字可能存在多个类别中，我们就需要指定特定的类别来查看；（一般我们查询bash命令，归类在1类中）；
man页面所属的分类标识(常用的是分类1和分类3) 
	(1)、用户可以操作的命令或者是可执行文件 
	(2)、系统核心可调用的函数与工具等
	(3)、一些常用的函数与数据库 
	(4)、设备文件的说明 
	(5)、设置文件或者某些文件的格式 
	(6)、游戏  
	(7)、惯例与协议等。例如Linux标准文件系统、网络协议、ASCⅡ，码等说明内容  
	(8)、系统管理员可用的管理条令  
	(9)、与内核有关的文件 
 

前面说到使用whatis会显示命令所在的具体的文档类别，我们学习如何使用它 
``` bash
eg:
$whatis printf  
printf               (1)  - format and print data  
printf               (1p)  - write formatted output  
printf               (3)  - formatted output conversion  
printf               (3p)  - print formatted output  
printf [builtins]    (1)  - bash built-in commands, see bash(1)  
我们看到printf在分类1和分类3中都有；分类1中的页面是命令操作及可执行文件的帮助；而3是常用函数库说明；如果我们想看的是C语言中printf的用法，可以指定查看分类3的帮助：
$man 3 printf
$man -k keyword
```
\*查询关键字
根据命令中部分关键字来查询命令，适用于只记住部分命令的场合；
eg：查找GNOME的config配置工具命令::
``` bash
$man -k GNOME config| grep 1  
\_对于某个单词搜索，可直接使用/word来使用:   /-a;  
```
#### 使用which命令
查看程序的binary文件所在路径::
``` bash
$which command  
```	
eg:查找make程序安装路径

``` bash
$which make
/opt/app/openav/soft/bin/make install
```
查看程序的搜索路径
``` bash
$whereis command
```
当系统中安装了同一软件的多个版本时，不确定使用的是哪个版本时，这个命令就能派上用场；
#### 使用help命令
一般命令会自带help命令 参数为—help 或-h等，一般来查看命令的具体用途
	eg:chown 命令的帮助
	
``` bash
$chown
chown: 缺少操作数
Try 'chown --help' for more information.
```	
``` bash
$chown --help
示例：
	chown root /u     将 /u 的属主更改为"root"。
	chown root:staff /u   和上面类似，但同时也将其属组更改为"staff"。
	chown -hR root /u 将 /u 及其子目录下所有文件的属主更改为"root"。
``` 
总结
whatis info man which whereis help
