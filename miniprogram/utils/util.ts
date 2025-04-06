export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

// API基础地址，根据环境配置
export const apiBaseUrl = 'https://ruoyi-back.xiaofeng.show/dev-tool';  // 生产环境
// export const apiBaseUrl = 'https://example.com/api';  // 生产环境
