#! /usr/bin/env node

'use strict'

// Dependencies
const chalk = require('chalk')
const request = require('request')
const vorpal = require('vorpal')()
const _ = require('lodash')

// cbcluster constants
const packageJson = require('cbcluster/package').name
const userAgent = 'cbcluster v' + packageJson.version

// Default Couchbase Server variables
var cbAdmin = 'Administrator'
var cbPass = 'couchbase'

// Clean up API response body by removing [""]
var bodyStrip = function (body) {
  var cleanBody = body.replace(/["]+/g, '').replace(/[\[\]']+/g, '')
  return cleanBody
}

// Add node to cluster
vorpal
  .command('addn', 'Add node to existing cluster')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: node.local)')
  .option('-t --target', 'Hostname or IP address of node to add')
  .option('-s --services', 'Node services (kv,index,n1ql)')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/controller/addNode'
    var formData = {
      user: args.options.user,
      password: args.options.pass,
      hostname: args.options.target,
      services: args.options.services
    }
    request.post({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      },
      form: formData
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        self.log(chalk.green('SUCCESS: Node ' + args.options.target + ' added to cluster'))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Create bucket
vorpal
  .command('bckt', 'Create bucket')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: node.local)')
  .option('-n --name', 'Bucket name')
  .option('-m --memory', 'Bucket RAM quota (in megabytes)')
  .option('-e --eviction', 'Eviction policy (fullEviction or valueOnly)')
  .option('-c --compaction', 'Automatic compaction enabled [0|1]')
  .option('-f --flush', 'Bucket flush enabled [0|1]')
  .option('-i --index', 'View index replicas [0|1])')
  .option('-r --replicas', 'Number of replicas (1-3)')
  .option('-t --type', 'Bucket type (membase, or memcached)')
  .option('-a --auth', 'Auth type (sasl or none)')
  .option('-d --dedicated', 'Dedicated port number for auth-less bucket')
  .option('-s --saslpass', 'SASL authentication password')
  .option('-w --wthreads', 'Writer threads / Disk I/O optimization (2-8)')
  .option('-x --xport', 'Alternative cluster administration port')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/pools/default/buckets'
    var formData = {
      autoCompaction: args.options.compaction || 0,
      flushEnabled: args.options.flush || 0,
      threadsNumber: args.options.wthreads || 3,
      replicaIndex: args.options.index || 0,
      replicaNumber: args.options.replicas || 1,
      evictionPolicy: args.options.eviction || 'valueOnly',
      ramQuotaMB: args.options.memory || 128,
      bucketType: args.options.type || 'membase',
      name: args.options.name,
      authType: args.options.auth || 'sasl',
      saslPassword: args.options.saslpass,
      proxyPort: args.options.dedicated
    }
    request.post({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      },
      form: formData
    }, function (error, response, body) {
      if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else if (!error && response.statusCode === 200 || response.statusCode === 202) {
        self.log(chalk.green('SUCCESS: Created ' + args.options.name + ' bucket on node ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Eject node from cluster
vorpal
  .command('ejct', 'Eject node from cluster')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: node.local)')
  .option('-t --target', 'Hostname or IP address of node to eject')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/controller/ejectNode'
    var otpNode = 'ns_1@' + args.options.target
    var formData = {
      user: args.options.user,
      password: args.options.pass,
      otpNode: otpNode
    }
    request.post({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      },
      form: formData
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        self.log(chalk.green('SUCCESS: Node ' + args.options.target + ' ejected from cluster'))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Eject node from cluster
vorpal
  .command('flvr', 'Fail over node')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: node.local)')
  .option('-t --target', 'Hostname or IP address of node to fail over')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/controller/failOver'
    var otpNode = 'ns_1@' + args.options.target
    var formData = {
      user: args.options.user,
      password: args.options.pass,
      otpNode: otpNode
    }
    request.post({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      },
      form: formData
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        self.log(chalk.green('SUCCESS: Node ' + args.options.target + ' failed over'))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Initialize node
vorpal
  .command('init', 'Initialize cluster node')
  .option('-u --user', 'Cluster administrator username (default: Administrator)')
  .option('-p --pass', 'Cluster Server administrator password (default: couchbase')
  .option('-d --data', 'Data path (default: /opt/couchbase/var/lib/couchbase/data)')
  .option('-i --index', 'Index path (default: /opt/couchbase/var/lib/couchbase/index)')
  .option('-h --host', 'Node URL (example: node.local)')
  .option('-x --xport', 'Alternative cluster administration port')
  .action(function (args, callback) {
    const self = this
    const cbDataPath = '/opt/couchbase/var/lib/couchbase/data'
    const cbIndexPath = '/opt/couchbase/var/lib/couchbase/index'
    const endPoint = '/nodes/self/controller/settings'
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    var formData = {
      data_path: cbDataPath || args.options.data,
      index_path: cbIndexPath || args.options.index
    }
    request.post({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      },
      form: formData
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        self.log(chalk.green('SUCCESS: Initialized node: ' + cbNode))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Name node
vorpal
  .command('name', 'Specify node name')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: node.local)')
  .option('-n --name', 'Node name (hostname or IP address)')
  .option('-x --xport', 'Alternative cluster administration port')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/node/controller/rename'
    var formData = {hostname: args.options.name}
    request.post({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      },
      form: formData
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        self.log(chalk.green('SUCCESS: Named node: ' + args.options.name))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Rebalance cluster
vorpal
  .command('rebl', 'Rebalance cluster')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: node.local)')
  .option('-e --ejected', 'Comma separated list of nodes to eject')
  .option('-k --known', 'Comma separated list of known nodes, including added')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/controller/rebalance'
    if (args.options.ejected === undefined) {
      args.options.ejected = ''
    } else if (args.options.ejected.indexOf(',') > -1) {
      var otpEjectedNodes = 'ns_1@' + (args.options.ejected.split(',').join(' ns_1@').split(' ').join(','))
    } else {
      otpEjectedNodes = 'ns_1@' + args.options.ejected
    }

    if (args.options.known) {
      var otpKnownNodes = 'ns_1@' + (args.options.known.split(',').join(' ns_1@').split(' ').join(','))
    } else {
      self.log(chalk.red('ERROR: -k option required'))
    }
    var formData = {
      ejectedNodes: otpEjectedNodes || '',
      knownNodes: otpKnownNodes
    }
    request.post({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      },
      form: formData
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        self.log(chalk.green('SUCCESS: Cluster rebalancing'))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Specify services
vorpal
  .command('svcs', 'Specify node services')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: node.local)')
  .option('-s --services', 'Node services (kv, index, n1ql)')
  .option('-x --xport', 'Alternative cluster administration port')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/node/controller/setupServices'
    var formData = { services: args.options.services }
    request.post({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      },
      form: formData
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        self.log(chalk.green('SUCCESS: Specified services on node ' + cbNode + ': ' + args.options.services))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Specify admin user and password
vorpal
  .command('user', 'Specify administrator username and password')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: node.local)')
  .option('-x --xport', 'Alternative cluster administration port')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/settings/web'
    var formData = {
      password: args.options.pass,
      username: args.options.user,
      port: 'SAME'
    }
    request.post({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      },
      form: formData
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        self.log(chalk.green('SUCCESS: Set administrator on node ' + cbNode + ': ' + args.options.user))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Get Couchbase Server version
vorpal
  .command('vers', 'Get Couchbase Server version')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: node.local)')
  .option('-x --xport', 'Alternative cluster administration port')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/pools'
    request({
      url: 'http://' + cbNode + ':' + cbPort + endPoint,
      headers: {
        'User-Agent': userAgent
      },
      'auth': {
        'user': args.options.user || cbAdmin,
        'pass': args.options.pass || cbPass,
        'sendImmediately': true
      }
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var cbVersion = JSON.parse(body).implementationVersion
        self.log(chalk.green('SUCCESS: Couchbase Server node ' + cbNode + ' version: ' + cbVersion))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

// Help rewrites
const help = vorpal.find('help')
if (help) {
  help.remove()
}

vorpal
  .command('help [command]')
  .description('Provides help for a given command')
  .action(function (args, cb) {
    if (args.command) {
      var name = _.findWhere(this.parent.commands, {_name: String(args.command).toLowerCase().trim()})
      if (name && !name._hidden) {
        this.log(name.helpInformation())
      } else {
        this.log(this.parent._commandHelp(args.command))
      }
    } else {
      this.log(this.parent._commandHelp(args.command))
    }
    cb()
  })

const exit = vorpal.find('exit')
if (exit) {
  exit.remove()
}

vorpal
  .command('exit')
  .alias('quit')
  .option('-f, --force', 'Forces process kill without confirmation.')
  .description('Exits this instance of cbcluster')
  .action(function (args) {
    args.options = args.options || {}
    args.options.sessionId = this.session.id
    this.parent.exit(args.options)
  })

vorpal
  .delimiter('cbcluster>')
  .show()
