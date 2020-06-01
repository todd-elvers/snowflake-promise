declare module "snowflake-sdk" {
  declare namespace Logging {
    export type Fn = (sqlText: string) => void;

    export type Options = {
      /** optional function to log SQL statements (e.g. console.log) */
      readonly logSql?: Logging.Fn;

      /** turn on SDK-level logging */
      readonly logLevel?: "error" | "warn" | "debug" | "info" | "trace";
    };
  }

  declare namespace Config {
    declare type Options = {
      readonly insecureConnect: boolean;
      readonly ocspFailOpen: boolean;
    };
  }

  declare namespace Connection {
    declare type Options = {
      /**
       * Name of your Snowflake account as it appears in the URL for accessing the
       * web interface. For example, in https://abc123.snowflakecomputing.com,
       * abc123 is the account name.
       */
      readonly account: string;

      /** Snowflake user login name to connect with. */
      readonly username: string;

      /** Password for the user. */
      readonly password: string;

      /**
       * Region for the user. Currently, only required for users connecting to the
       * following regions:
       *   US East: us-east-1
       *   EU (Frankfurt): eu-central-1
       */
      readonly region?: string;

      /** The default database to use for the session after connecting. */
      readonly database?: string;

      /** The default schema to use for the session after connecting. */
      readonly schema?: string;

      /**
       * The default virtual warehouse to use for the session after connecting. Used
       * for performing queries, loading data, etc.
       */
      readonly warehouse?: string;

      /** The default security role to use for the session after connecting. */
      readonly role?: string;

      /**
       * By default, client connections typically time out approximately 3-4 hours
       * after the most recent query was executed. If the parameter clientSessionKeepAlive is set to true,
       * the client’s connection to the server will be kept alive indefinitely, even if no queries are executed.
       * The default setting of this parameter is false. If you set this parameter to true, make sure that your
       * program explicitly disconnects from the server when your program has finished.
       * Do not exit without disconnecting.
       */
      readonly clientSessionKeepAlive?: boolean;

      /**
       * (Applies only when clientSessionKeepAlive is true)
       * This parameter sets the frequency (interval in seconds) between heartbeat messages.
       * You can loosely think of a connection heartbeat message as substituting for a query
       * and restarting the timeout countdown for the connection. In other words, if the connection
       * would time out after at least 4 hours of inactivity, the heartbeat resets the timer so that
       * the timeout will not occur until at least 4 hours after the most recent heartbeat (or query).
       * The default value is 3600 seconds (one hour). The valid range of values is 900 - 3600. Because
       * timeouts usually occur after at least 4 hours, a heartbeat every 1 hour is normally sufficient
       * to keep the connection alive. Heartbeat intervals of less than 3600 seconds are rarely necessary or useful.
       */
      readonly clientSessionKeepAliveHeartbeatFrequency?: number;
    };
  }

  declare namespace Options {}

  // export interface LoggingOptions

  declare type ConfigurationOptions = {
    readonly logLevel: "trace" | "debug" | "info" | "warn" | "error";
  };

  declare function configure(options: Partial<ConfigurationOptions>): void;

  declare type ConnectionOptions = {};

  declare type SnowflakeError = {
    readonly name: keyof {
      // Synchronous errors
      readonly InternalAssertError: "InternalAssertError";
      readonly MissingParameterError: "MissingParameterError";
      readonly InvalidParameterError: "InvalidParameterError";

      // Asynchronous errors
      readonly NetworkError: "NetworkError";
      readonly RequestFailedError: "RequestFailedError";
      readonly UnexpectedContentError: "UnexpectedContentError";
      readonly OperationFailedError: "OperationFailedError";
      readonly LargeResultSetError: "LargeResultSetError";
      readonly ClientError: "ClientError";
      readonly OCSPError: "OCSPError";
    };

    readonly message: string;
    readonly code: number;
    readonly sqlState: string; // The state of the SQL at the time of the error

    readonly data?: any;
    readonly response?: any;
    readonly responseBody?: any;
    readonly cause?: any;
    readonly isFatal?: boolean;
    readonly stack?: any;
  };

  type ConnectionCallback = (error: SnowflakeError, conn: Connection) => void;
  type ExecutionCallback = (
    err: SnowflakeError,
    stmt: any,
    rows: ReadonlyArray<any>
  ) => void;

  type ExecuteOptions = {
    readonly sqlText: string;
    readonly complete: ExecutionCallback;
  };

  type Connection = {
    readonly getId: () => string;
    readonly connect: (callback: ConnectionCallback) => Connection;
    readonly destroy: (callback: ConnectionCallback) => Connection;
    readonly execute: (options: ExecuteOptions) => Promise<ReadonlyArray<any>>;
  };

  // TODO: There's an optional second argument called 'config'
  declare function createConnection(options: ConnectionOptions): Connection;
}
