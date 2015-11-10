#! /usr/bin/env node

'use strict'

// Dependencies
const chalk = require('chalk')
const request = require('request')
const vorpal = require('vorpal')()
const _ = require('lodash')

// cbcluster constants
const packageJson = require('./package.json')
const userAgent = 'cbcluster v' + packageJson.version

// Default Couchbase Server variables
var cbAdmin = 'Administrator'
var cbPass = 'couchbase'

// Clean up API response body by removing [""]
var bodyStrip = function (body) {
  var cleanBody = body.replace(/["]+/g, '').replace(/[\[\]']+/g, '')
  return cleanBody
}

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

vorpal
  .command('name', 'Specify node name')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: http://node.local:8091)')
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

vorpal
  .command('user', 'Specify administrator username and password')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: http://node.local:8091)')
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

vorpal
  .command('svcs', 'Specify node services')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: http://node.local:8091)')
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

vorpal
  .command('bckt', 'Create bucket')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: http://node.local:8091)')
  .option('-n --name', 'Bucket name')
  .option('-m --memory', 'Bucket RAM quota (in megabytes)')
  .option('-e --eviction', 'Eviction policy (fullEviction or valueOnly)')
  .option('-f --flush', 'Bucket flush enabled (0 or 1)')
  .option('-i --index', 'View index replicas (0 or 1)')
  .option('-r --replicas', 'Number of replicas (1-3)')
  .option('-t --type', 'Bucket type (membase, or memcached)')
  .option('-a --auth', 'Auth type (sasl or FIXME)')
  .option('-s --saslpass', 'SASL authentication password')
  .option('-w --wthreads', 'Number of writer threads (2 - FIXME)')
  .option('-x --xport', 'Alternative cluster administration port')
  .action(function (args, callback) {
    const self = this
    const cbNode = args.options.host
    const cbPort = 8091 || args.options.xport
    const endPoint = '/pools/default/buckets'
    var cbBucketType = 'membase'
    var cbEvictionPolicy = 'valueOnly'
    var cbBucketAuth = 'sasl'
    var cbReplicas = 1
    var cbReplicaIndex = 0
    var cbFlush = 0
    var formData = {
      flushEnabled: args.options.flush || cbFlush,
      threadsNumber: args.options.wthreads || 2,
      replicaIndex: args.options.index || cbReplicaIndex,
      replicaNumber: args.options.replicas || cbReplicas,
      evictionPolicy: args.options.eviction || cbEvictionPolicy,
      ramQuotaMB: args.options.memory,
      bucketType: args.options.type || cbBucketType,
      name: args.options.name,
      authType: args.options.auth || cbBucketAuth,
      saslPassword: args.options.saslpass
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

vorpal
  .command('vers', 'Get Couchbase Server version')
  .option('-u --user', 'Couchbase Server administrator username')
  .option('-p --pass', 'Couchbase Server administrator password')
  .option('-h --host', 'Node URL (ex: http://node.local:8091)')
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
        self.log(chalk.green('SUCCESS: Couchbase Server node: ' + cbNode + ' version: ' + cbVersion))
      } else if (response === undefined) {
        self.log(chalk.red('ERROR: Cannot communicate with ' + cbNode))
      } else {
        self.log(chalk.red('ERROR: ' + response.statusCode + ' ' + bodyStrip(body)))
      }
      callback()
    })
  })

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
