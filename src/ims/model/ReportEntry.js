import invariant from "invariant";
import { DateTime } from "luxon";

export default class ReportEntry {
  static fromJSON = (json) => {
    try {
      return new ReportEntry({
        created: DateTime.fromISO(json.created),
        author: json.author,
        systemEntry: json.system_entry,
        text: json.text,
      });
    } catch (e) {
      throw new Error(
        `Invalid report entry JSON (${e}): ${JSON.stringify(json)}`,
      );
    }
  };

  constructor({ created, author, systemEntry, text }) {
    invariant(created != null, "created is required");
    invariant(author != null, "author is required");
    invariant(systemEntry != null, "systemEntry is required");
    invariant(text != null, "text is required");

    this.created = created;
    this.author = author;
    this.systemEntry = systemEntry;
    this.text = text;
  }

  toString = () => {
    const systemEntry = this.systemEntry ? "🤖" : "";

    return `${this.created} ${this.author}${systemEntry}: ${this.text}`;
  };

  toJSON = () => {
    return {
      created: this.created.toISO(),
      author: this.author,
      system_entry: this.systemEntry,
      text: this.text,
    };
  };
}
