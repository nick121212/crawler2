# crawler2
爬虫2.0
# 环境要求
## 1、nodejs >= 5.0.0
## 2、elasticsearch >= 2.3
## 3、rabbitmq >= 3.2.4

代理节点启动命令：NODE_ENV=production NODE_IPS=106.75.78.203:3000 NODE_CHIP=1 forever start .
爬虫启动命令：ENV=production NODE_IPS=106.75.78.203:3000 NODE_QUEUE=106.75.78.203 forever start .