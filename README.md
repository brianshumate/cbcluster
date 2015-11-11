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
cbcluster> help

  Commands:

    addn [options]   Add node to existing cluster
    bckt [options]   Create bucket
    ejct [options]   Eject node from cluster
    flvr [options]   Fail over node
    init [options]   Initialize cluster node
    name [options]   Specify node name
    rebl [options]   Rebalance cluster
    svcs [options]   Specify node services
    user [options]   Specify administrator username and password
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
| Administrator username | *Administrator* | [string] can be overridden with `-u` |
| Administrator password | *couchbase*     | [string] can be overridden with `-p` |
| Node data path | */opt/couchbase/var/lib/couchbase/data* | [string] can be overridden with `-d` |
| Node index path | */opt/couchbase/var/lib/couchbase/index* | [string] can be overridden with `-i` |
| Node port | *8091* | [int] can be overridden with `-x` |
| Bucket type | *membase* | [string] can be overridden with `-t` note that *membase* is the name for a *couchbase* style bucket; the other option is *memcached* |
| Per Node RAM Quota | *128* | [int] RAM quota per node for bucket (in megabytes) |
| Cache metadata | *valueOnly* | [string] can be overridden with `-e` |
| Access control | *sasl* | [string] can be overridden with `-a` |
| Replicas | *1* | can be overridden with `-r` |
| Index replicas | *0* | [0|1] can be overridden with `-i` |
| Auto compaction | *0* | [0|1] can be overridden with `-c` |
| Flush | *0* | [0|1] can be overridden with `-f` |

All the above defaults can of course be overridden by command options.

### Usage Examples

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

#### Fail Node Over and Rebalance Out

This example shows how to fail a node over, eject it from the cluster, and
then perform a rebalance; this makes the failed over node no longer a
cluster member.

```
cbcluster> flvr -h cb1.local -t cb2.local
SUCCESS: Node cb2.local failed over
cbcluster> ejct -h cb1.local -t cb2.local
SUCCESS: Node cb2.local ejected from cluster
cbcluster> rebl -h cb1.local -k cb1.local,cb3.local
SUCCESS: Cluster rebalancing
```

## References

1. [Creating a new cluster](http://developer.couchbase.com/documentation/server/4.0/rest-api/rest-node-provisioning.html)
