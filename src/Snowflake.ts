import { Either, Option, pipe, TaskEither } from "@morphism/fp";
import * as SDK from "snowflake-sdk";
import * as NodeJS from "util";

export type Options = SDK.Logging.Options &
  SDK.Config.Options &
  SDK.Connection.Options;

namespace Connection {
  let _connectionToSDK: SDK.Connection | undefined;
  let _sqlLoggingFn: ((sqlText: string) => void) | undefined;

  export const get = () =>
    pipe(
      _connectionToSDK,
      Option.fromNullable,
      Either.fromOption(
        () => new Error("Snowflake connection not yet initialized.")
      )
    );

  //TODO: Do we need to wire this up somewhere?
  export const getLogger = (): Option.Option<SDK.Logging.Fn> =>
    pipe(_sqlLoggingFn, Option.fromNullable);

  export const init = (options: Partial<Options>): SDK.Connection => {
    SDK.configure({ ...defaults(), ...options });
    _sqlLoggingFn = options.logSql;
    console.log("SQL logger: ", _sqlLoggingFn);
    return (_connectionToSDK = SDK.createConnection(options));
  };

  const defaults = (): Partial<Options> => ({
    logLevel: "error",
    insecureConnect: false,
    ocspFailOpen: true,
    clientSessionKeepAlive: false, // Sessions timeout ~4 hrs after last query
    clientSessionKeepAliveHeartbeatFrequency: 3600, // Seconds
  });
}

export const init = (options: Partial<Options>) => Connection.init(options);

// TODO: What is the right order?  Do we initialize connection before we connect?
//   Or are we initializing the SDK /then/ connecting to Snowflake?
export const connect = (): Promise<Either.ErrorOr<SDK.Connection>> =>
  TaskEither.do()
    .bind("connection", TaskEither.fromEither(Connection.get()))
    .letL("connectFn", ({ connection }) => NodeJS.promisify(connection.connect))
    .doL(({ connectFn }) => TaskEither.fromUnsafe(() => connectFn()))
    .return(({ connection }) => connection)();

export const destroy = (): Promise<Either.ErrorOr<SDK.Connection>> =>
  TaskEither.do()
    .bind("connection", TaskEither.fromEither(Connection.get()))
    .letL("destroyFn", ({ connection }) => NodeJS.promisify(connection.destroy))
    .doL(({ destroyFn }) => TaskEither.fromUnsafe(() => destroyFn()))
    .return(({ connection }) => connection)();

const onComplete = (
  error: SDK.SnowflakeError,
  statement: any,
  rows: ReadonlyArray<any>
) => {
  console.log("Error:", error);
  console.log("Statement:", statement);
  console.log("Rows:", rows);
  return rows;
};

// TODO: make proper async connection.execute fn so we can call it here in a taskeither
export const execute = (sqlText: string) =>
  TaskEither.do()
    .bind("connection", TaskEither.fromEither(Connection.get()))
    .letL("executeFn", ({ connection }) => NodeJS.promisify(connection.execute))
    .let("args", { sqlText, complete: onComplete })
    .bindL("result", ({ executeFn, args }) =>
      TaskEither.fromUnsafe(() => executeFn(args))
    )
    .return(({ result }) => result)();

//
// export class Snowflake {
//   private readonly connection: SDK.Connection;
//   private readonly logSqlFn?: (sqlText: string) => void;
//
//   /**
//    * Creates a new Snowflake instance.
//    *
//    * @param connectionOptions The Snowflake connection options
//    * @param loggingOptions Controls query logging and SDK-level logging
//    * @param configureOptions Additional configuration options
//    */
//   constructor(
//     connectionOptions: ConnectionOptions,
//     loggingOptions: LoggingOptions = {},
//     configureOptions?: SDK.ConfigurationOptions
//   ) {
//     if (loggingOptions && loggingOptions.logLevel) {
//       SDK.configure({ logLevel: loggingOptions.logLevel });
//     }
//
//     this.logSqlFn = (loggingOptions && loggingOptions.logSql) || undefined;
//
//     // For backward compatibility, configureOptions is allowed to be a boolean, but it’s
//     // ignored. The new default settings accomplish the same thing as the old
//     // `insecureConnect` boolean.
//
//     if (configureOptions) SDK.configure(configureOptions);
//
//     this.connection = SDK.createConnection(connectionOptions);
//   }
//
//   /** the connection id */
//   get id(): string {
//     return this.connection.getId();
//   }
//
//   /** Establishes a connection if we aren't in a fatal state. */
//   connect() {
//     return new Promise<void>((resolve, reject) => {
//       this.connection.connect((err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });
//   }
//
//   /**
//    * Immediately terminates the connection without waiting for currently
//    * executing statements to complete.
//    */
//   destroy() {
//     return new Promise<void>((resolve, reject) => {
//       this.connection.destroy((err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });
//   }
//
//   /** Create a Statement. */
//   createStatement(options: ExecuteOptions) {
//     return new Statement(this.connection, options, this.logSqlFn);
//   }
//
//   /** A convenience function to execute a SQL statement and return the resulting rows. */
//   execute(sqlText: string, binds?: readonly any[]) {
//     const stmt = this.createStatement({ sqlText, binds });
//     stmt.execute();
//     return stmt.getRows();
//   }
// }
