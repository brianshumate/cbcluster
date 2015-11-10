```
     |         |              |
,---.|---.,---.|    .   .,---.|--- ,---.,---.
|    |   ||    |    |   |`---.|    |---'|
`---'`---'`---'`---'`---'`---'`---'`---'`
```

`cbcluster` is a small immersive command line utility for interacting with
Couchbase Server clusters.

Development is ongoing to mirror some of the examples shown in the
[REST API Reference](http://developer.couchbase.com/documentation/server/4.0/rest-api/rest-intro.html) documentation. The primary focus of this tool is
compact commands for quick cluster interaction.

## Installation

With NPM:

```
npm install -g cbcluster
```

From this repository:

```
git clone https://github.com/brianshumate/cbcluster.git
cd cbcluster
npm install
npm link
```

## Usage

Start `cbcluster`:

```
cbcluster
```

Get help:

```
  Commands:

    init [options]   Initialize cluster node
    name [options]   Specify node name
    user [options]   Set administrator username and password
    svcs [options]   Specify node services
    bckt [options]   Define a bucket
    vers [options]   Get Couchbase Server version
    help [command]   Provides help for a given command
    exit [options]   Exits this instance of cbcluster
```

You can also get help for individual commands with `help <command>`.

### A note about defaults

For the sake of convenience, `cbcluster` includes some sensible defaults
and the defaults (for e.g. bucket creation) which you will find in the
Couchbase Server web console user interface:

| Default setting        | Value           | Notes                       |
| ---------------------- | --------------- | ----------------------------| 
| Administrator username | *Administrator* | can be overridden with `-u` |
| Administrator password | *couchbase*     | can be overridden with `-p` |
| Node data path | */opt/couchbase/var/lib/couchbase/data* | can be overridden with `-d` |
| Node index path | */opt/couchbase/var/lib/couchbase/index* | can be overridden with `-i` |
| Node port | *8091* | can be overridden with `-x` |
| Bucket type | *membase* | can be overridden with `-t` note that *membase* is the name for a *couchbase* style bucket; the other option is *memcached* |
| Cache metadata | *valueOnly* | can be overridden with `-e` |
| Access control | *sasl* | can be overridden with `-a` |
| Replicas | *1* | can be overridden with `-r` |

All the above defaults can be overridden by command options.

### Usage Example

This example follows the [Creating a new cluster](http://developer.couchbase.com/documentation/server/4.0/rest-api/rest-node-provisioning.html) documentation and covers most of the current abilities available in
`cbcluster`.

#### Initialize Node

The first step in building a cluster is to initialize the node:

```
cbcluster> init -h cb3.local
SUCCESS: Initialized node: cb3.local
```

#### Specify Node Name

```
cbcluster> name -h cb3.local -n cb3.local
SUCCESS: Named node: cb3.local
```

#### Specify Node Services

```
cbcluster> svcs -h cb3.local -s kv,n1ql
SUCCESS: Specified services on node cb3.local: kv,n1ql
```

#### Specify Administrator Username and Password

```
user -h cb3.local -u Administrator -p tacotown
SUCCESS: Set administrator on node cb3.local: Administrator
```

#### Create Bucket

```
cbcluster> bckt -h cb3.local -p tacotown -n tacos -m 128 -s secretsalsa
SUCCESS: Created tacos bucket on node cb3.local
```

## References

1. [Creating a new cluster](http://developer.couchbase.com/documentation/server/4.0/rest-api/rest-node-provisioning.html)
