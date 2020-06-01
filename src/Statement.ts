// import * as SDK from "snowflake-sdk";
// import { Readable } from "stream";
// import { ExecuteOptions } from "./types/ExecuteOptions";
// import { StatementAlreadyExecutedError } from "./types/StatementAlreadyExecutedError";
// import { StatementNotExecutedError } from "./types/StatementNotExecutedError";
// import { StreamRowsOptions } from "./types/StreamRowsOptions";
//
// export type Statementt = {
//   readonly execute: (sqlText: string) => void;
// };
//
// export class Statement {
//   private readonly rows: readonly any[] = null;
//   private readonly stmt: any = null;
//   private readonly executePromise: Promise<Statement> = null;
//
//   /**
//    * @param connection the connection object from the SDK
//    * @param executeOptions the Statement configuration, including the sqlText
//    * @param logSql function to use to log SQL statements
//    */
//   constructor(
//     private readonly connection: any,
//     private readonly executeOptions: ExecuteOptions,
//     private readonly logSql: SDK.Logging.Fn | null = null
//   ) {}
//
//   /**
//    * Execute this Statement.
//    * @throws if the statement was previously executed or an error occurs
//    * @return Promise<void>
//    */
//   execute() {
//     if (this.executePromise) {
//       throw new StatementAlreadyExecutedError();
//     }
//
//     this.executePromise = new Promise((resolve, reject) => {
//       const startTime: number;
//
//       this.executeOptions["complete"] = (err, stmt, rows) => {
//         const elapsed = Date.now() - startTime;
//         if (err) {
//           reject(err);
//         }
//         if (this.logSql) {
//           this.log(elapsed);
//         }
//         this.rows = rows;
//         resolve();
//       };
//
//       startTime = Date.now();
//       this.stmt = this.connection.execute(this.executeOptions);
//     });
//
//     return this.executePromise;
//   }
//
//   /** Cancel a currently-executing Statement. */
//   cancel() {
//     return new Promise<void>((resolve, reject) => {
//       this.stmt.cancel((err) => {
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
//    * Get the rows returned by the Statement.
//    * @throws if the Statement was not in streaming mode
//    */
//   getRows() {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.executePromise.then(() => this.rows);
//   }
//
//   /**
//    * Stream the rows returned by the Statement.
//    * @throws if the statement was in non-streaming mode
//    */
//   streamRows(options: StreamRowsOptions = {}): Readable {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.streamRows(options);
//   }
//
//   /** this statement's SQL text */
//   getSqlText(): string {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.getSqlText();
//   }
//
//   /** the current status of this statement */
//   getStatus(): string {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.getStatus();
//   }
//
//   /** the columns produced by this statement */
//   getColumns(): readonly object[] {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.getColumns();
//   }
//
//   /**
//    * Given a column identifier, returns the corresponding column. The column
//    * identifier can be either the column name (String) or the column index
//    * (Number). If a column is specified and there is more than one column with
//    * that name, the first column with the specified name will be returned.
//    */
//   getColumn(columnIdentifier: string | number): object {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.getColumn(columnIdentifier);
//   }
//
//   /** the number of rows returned by this statement */
//   getNumRows(): number {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.getNumRows();
//   }
//
//   /** the number of rows updated by this statement */
//   getNumUpdatedRows(): number {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.getNumUpdatedRows();
//   }
//
//   /**
//    * Returns an object that contains information about the values of the
//    * current warehouse, current database, etc., when this statement finished
//    * executing.
//    */
//   getSessionState() {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.getSessionState();
//   }
//
//   /** the request id that was used when the statement was issued */
//   getRequestId(): string {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.getRequestId();
//   }
//
//   /**
//    * Returns the statement id generated by the server for this statement.
//    * If the statement is still executing and we don't know the statement id
//    * yet, this method will return undefined.
//    */
//   getStatementId(): object {
//     if (!this.executePromise) {
//       throw new StatementNotExecutedError();
//     }
//     return this.stmt.getStatementId();
//   }
//
//   /** log execution details */
//   private log(elapsedTime: number) {
//     const logMessage = "Executed";
//
//     const state = this.getSessionState();
//     if (state) {
//       logMessage += ` (${state.getCurrentDatabase()}.${state.getCurrentSchema()})`;
//     }
//
//     logMessage += `: ${this.getSqlText()}`;
//     if (logMessage[logMessage.length - 1] !== ";") {
//       logMessage += ";";
//     }
//
//     if (this.executeOptions.binds) {
//       logMessage += `  with binds: ${JSON.stringify(
//         this.executeOptions.binds
//       )};`;
//     }
//
//     logMessage += `  Elapsed time: ${elapsedTime}ms`;
//
//     this.logSql(logMessage);
//   }
// }
