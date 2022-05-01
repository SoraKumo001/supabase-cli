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
  migration           [command]
    create [name]     Create migration
    up                Apply migrations
  remote              [command]
    restore <host> <password> <filename>  Restore remote databases
    backup <host> <password> <filename>   Backup remote databases
  help [command]  display help for command
```

## When making remote backups

You will need superuser privileges, so run the following command from SQLEditor on the web.

```sql
alter role postgres with superuser;
```
