module.exports = {
  blacklistfile:'/srv/rewriter/blacklist/iplist',
  filespath: '/srv/rewriter/rules/',
  port : 8080,
  resturl : '/rwconfx',
  testurl : '/rwtst',
  infourl : '/rwinfo',

  msg :{
    ErrorHeader : "Url Rewriter V4\nIt seems that we have a problem\nPlease contact our Helpdesk\n",
    IpNotAllowed : "is not allowed to use this proxy",
    ErrorReadConfig : "Error during config file access",
    ErrorReadBlacklist : "Error Reading Ip list",
    ErrorHostNotDefined : "is not in the configuration file",
    ReadRestUrl : "request config by calling url",
    ReadTestUrl : "test config by calling url",
    ConfigLoader : "(Re)Loading Configuration",
    ConfigLength : " Entries in Config"
  }
}