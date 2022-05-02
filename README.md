# supabase-cli

## description

Create a cli environment for supabase.  
The Docker environment to be used for construction is obtained from the latest repository of supabase.

## usage

```
Usage: spabase-cli [options] [command]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  init                Initialize supabase
  start               Launch supabase
  stop                Stop supabase
  restart             Restart supabase
  remove              Remove supabase
  update              Update supabase
  reset               Database initialization
  info                View access to supabase
  backup <filename>   Backup database
  restore <filename>  Restore database
  user                [command]
    create <email> <password>  Create a user
  migration           [command]
    create [name]     Create migration
    up                Apply migrations
  remote              [command]
    restore [options] <filename> Restore remote databases
      -a, --host <host>          Host address of database
      -p, --password <password>  Password for database
    backup [options] <filename>  Backup remote databases
      -a, --host <host>          Host address of database
      -p, --password <password>  Password for database
    migration [options]          Migration remote databases
      -a, --host <host>          Host address of database
      -p, --password <password>  Password for database
    reset [options]              Reset the remote
      -a, --host <host>          Host address of database
      -p, --password <password>  Password for database
  help [command]  display help for command
```

Remote commands refer to the value of `supabase/.env.remote`

```env
url=https://xxxxx.supabase.co
service_role=xxxx
db_password="xxxx"
```

## For remote backup and remote reset

You will need superuser privileges, so run the following command from SQLEditor on the web.

```sql
alter role postgres with superuser;
```

Remote operation is an experimental feature.

## Regarding initialization

### command

```sh
supabase-cli init
```

For the second and subsequent runs, the file is updated.

### Operation

#### 1. Download files to the `supabase` directory

- https://github.com/supabase/supabase/tree/master/docker
  - `.gitignore` will not be overwritten
- https://github.com/supabase/storage-api/tree/master/migrations/tenant/
- https://github.com/supabase/realtime//tree/master/server/priv/repo/migrations

#### 2. Creation of `supabase/docker/.env`

- If the file already exists, it will not be overwritten

#### 3. Recalculate AccessKey based on JWT_SECRET

- supabase/docker/.env
- supabase/docker/volumes/api/kong.yml

Recalculation of AccessKey by JWT_SECRET is also done at start.

## Startup and shutdown

### Startup of supabase

```sh
supabase-cli start
```

### Stop supabase

```sh
supabase-cli stop
```

### Remove containers from Docker

```sh
supabase-cli remove
```
