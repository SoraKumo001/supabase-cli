ALTER TABLE auth.users rename confirmed_at to email_confirmed_at;
ALTER TABLE auth.users rename email_change_token to email_change_token_new;
ALTER TABLE auth.users add IF NOT EXISTS phone character varying(15) default NULL;
ALTER TABLE auth.users add IF NOT EXISTS phone_confirmed_at timestamp(6) with time zone;
ALTER TABLE auth.users add IF NOT EXISTS phone_change character varying(15) default '';
ALTER TABLE auth.users add IF NOT EXISTS phone_change_token character varying(255) default '';
ALTER TABLE auth.users add IF NOT EXISTS phone_change_sent_at timestamp(6) with time zone;
ALTER TABLE auth.users add IF NOT EXISTS confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED;
ALTER TABLE auth.users add IF NOT EXISTS email_change_token_current character varying(255) default '';
ALTER TABLE auth.users add IF NOT EXISTS email_change_confirm_status smallint default 0;
ALTER TABLE auth.users add IF NOT EXISTS banned_until timestamp(6) with time zone;
ALTER TABLE auth.users add IF NOT EXISTS reauthentication_token character varying(255) default '';
ALTER TABLE auth.users add IF NOT EXISTS reauthentication_sent_at timestamp(6) with time zone;
ALTER TABLE auth.refresh_tokens add IF NOT EXISTS parent character varying(255);
create table IF NOT EXISTS auth.identities (
  id text not null
  , user_id uuid not null
  , identity_data jsonb not null
  , provider text not null
  , last_sign_in_at timestamp(6) with time zone
  , created_at timestamp(6) with time zone
  , updated_at timestamp(6) with time zone
);
ALTER ROLE authenticator WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:02GshyCgAmMuR80elRG3zA==$iGHHc+ke7uTIAH3R81LB96RSHK3mQBqpgntQYKWYbEc=:omgA+pHNI9zhml67pswdvF8wxr4X9McFVMXskcjshkQ=';
ALTER ROLE supabase_admin WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:Ek3JpfTwntQPt3nH8RX/nQ==$gR2VWqVgd184dcWFO1VuxfvS54Kc1nHO28GOgoyNef0=:4/u9yjgNAsxn/Ef8CCdsL9YrEWhlH1GK2k3K4Wr+xoI=';
ALTER ROLE supabase_auth_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:KwpL1tST/0JDjAM20fXN7g==$5ogPaRAdtoXGJYD4a5CKnR/IpBpO/QvNGdBQ82TtG/Q=:pnEvyPekmXg9GaTXRBUzlIoo4WrDRtCA8qO0MvGat2Y=';
ALTER ROLE supabase_storage_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:I5FEUDziWXHfELobqERsug==$Kia0Uk1GsB7PaotwpFQmCZHL4IDx69hP+b/qNP2TW4c=:jZDB9li42uENmR1UrYKXTy+gMC6025YSq9+2q7rBUDk=';
