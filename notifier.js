const axios = require('axios');
const pm2 = require('pm2');

// 替换为你的钉钉Webhook URL
// const DINGTALK_WEBHOOK_URL = 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_ACCESS_TOKEN';
const DINGTALK_WEBHOOK_URL = 'https://oapi.dingtalk.com/robot/send?access_token=515362e8bd6eed5c39136cf45cce7c45c5358cb546351391e30e6416c098de7b';

// 格式化PM2状态信息
const formatPm2Status = (list) => {
  return list.map(proc => {
    return {
      name: proc.name,
      status: proc.pm2_env.status,
      cpu: proc.monit.cpu,
      memory: (proc.monit.memory / 1024 / 1024).toFixed(2) + ' MB',
      uptime: (proc.pm2_env.pm_uptime ? new Date(Date.now() - proc.pm2_env.pm_uptime).toISOString().substr(11, 8) : 'N/A')
    };
  });
};

// 发送钉钉消息
const sendDingtalkMessage = (message) => {
  axios.post(DINGTALK_WEBHOOK_URL, {
    msgtype: 'markdown',
    markdown: {
      title: 'PM2 状态报告测试',
      text: message,
    }
  }).then(response => {
    console.log('Message sent to DingTalk:', response.data);
    console.log(message)
  }).catch(error => {
    console.error('Error sending message to DingTalk:', error);
  });
};

// 获取PM2状态并发送消息
const getPm2StatusAndNotify = () => {
  pm2.connect((err) => {
    if (err) {
      console.error('PM2 connect error:', err);
      return;
    }

    pm2.list((err, list) => {
      pm2.disconnect();

      if (err) {
        console.error('PM2 list error:', err);
        return;
      }

      const statusList = formatPm2Status(list);
      let message = '### PM2 状态报告\n\n';
      statusList.forEach(proc => {
        message += `- **${proc.name}**: ${proc.status}, CPU: ${proc.cpu}%, 内存: ${proc.memory}, 运行时间: ${proc.uptime}\n`;
      });

      sendDingtalkMessage(message);
    });
  });
};

// 每小时发送一次
// setInterval(getPm2StatusAndNotify, 3600000); // 3600000 ms = 1 hour
setInterval(getPm2StatusAndNotify, 3000); // 3600000 ms = 1 hour

// 立即运行一次
getPm2StatusAndNotify();

// sendDingtalkMessage('123456测试开始');