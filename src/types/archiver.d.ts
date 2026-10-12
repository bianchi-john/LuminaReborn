// Minimal types for archiver 5 (the package ships none): only what the photo export uses.
declare module 'archiver' {
  import { Transform } from 'stream';

  interface ArchiverOptions {
    /** Store entries without compressing them (JPEG and WebP are already compressed). */
    store?: boolean;
    forceZip64?: boolean;
    comment?: string;
  }

  interface EntryData {
    name: string;
    date?: Date;
  }

  class Archiver extends Transform {
    append(source: Buffer | string, data: EntryData): this;
    finalize(): Promise<void>;
    abort(): this;
    pointer(): number;
  }

  function archiver(format: 'zip', options?: ArchiverOptions): Archiver;
  export = archiver;
}
