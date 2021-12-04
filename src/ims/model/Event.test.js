import Event from "./Event";


describe("Event", () => {

  test(
    "toString", () => {
      const id = "1";
      const name = "One";
      const event = new Event(id, name);
      const eventJSON = { id: id, name: name };
      const result = event.toString();

      expect(result).toEqual(name);
    }
  );

  test(
    "toJSON", () => {
      const id = "1";
      const name = "One";
      const event = new Event(id, name);
      const eventJSON = { id: id, name: name };
      const result = event.toJSON();

      expect(result).toEqual(eventJSON);
    }
  );

  test(
    "fromJSON", () => {
      const id = "1";
      const name = "One";
      const event = new Event(id, name);
      const eventJSON = event.toJSON();
      const result = Event.fromJSON(eventJSON);
      const resultJSON = result.toJSON();

      expect(resultJSON).toEqual(eventJSON);
    }
  );

  test(
    "JSON round-trip through text", () => {
      const id = "1";
      const name = "One";
      const event = new Event(id, name);
      const eventJSONText = JSON.stringify(event.toJSON());
      const result = Event.fromJSON(JSON.parse(eventJSONText));
      const resultJSON = result.toJSON();

      expect(JSON.stringify(resultJSON)).toEqual(eventJSONText);
    }
  );

});
