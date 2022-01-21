import { DateTime } from "luxon";

import Event from "./Event";
import Incident from "./Incident";
import Location from "./Location";


describe("Incident", () => {

  test(
    "toString", () => {
      const eventID = "1";
      const number = 4;
      const created = DateTime.fromISO("2021-08-17T17:12:46.720000+00:00");
      const state = "open";
      const priority = 3;
      const location = new Location({});
      const summary = "Snake in someone's boots";
      const rangerHandles = ["Bucket", "Hubcap"];
      const incidentTypes = ["Medical", "Theme Camp"];
      const anIncident = new Incident(
        {
          "eventID": eventID,
          "number": number,
          "created": created,
          "state": state,
          "priority": priority,
          "summary": summary,
          "location": location,
          "rangerHandles": rangerHandles,
          "incidentTypes": incidentTypes,
        }
      );
      const result = anIncident.toString();

      expect(result).toEqual(`(${eventID}#${number})`);
    }
  );

  test(
    "toJSON, with location", () => {
      const eventID = "1";
      const number = 4;
      const created = DateTime.fromISO("2021-08-17T17:12:46.720000+00:00");
      const state = "open";
      const priority = 3;
      const location = new Location({});
      const summary = "Snake in someone's boots";
      const rangerHandles = ["Bucket", "Hubcap"];
      const incidentTypes = ["Medical", "Theme Camp"];
      const anIncident = new Incident(
        {
          "eventID": eventID,
          "number": number,
          "created": created,
          "state": state,
          "priority": priority,
          "summary": summary,
          "location": location,
          "rangerHandles": rangerHandles,
          "incidentTypes": incidentTypes,
        }
      );
      const result = anIncident.toJSON();

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify(
          {
            "event": eventID,
            "number": number,
            "created": created,
            "state": state,
            "priority": priority,
            "summary": summary,
            "location": location,
            "ranger_handles": rangerHandles,
            "incident_types": incidentTypes,
          }
        )
      );
    }
  );

  test(
    "toJSON, no location", () => {
      const eventID = "1";
      const number = 4;
      const created = DateTime.fromISO("2021-08-17T17:12:46.720000+00:00");
      const state = "open";
      const priority = 3;
      const summary = "Snake in someone's boots";
      const rangerHandles = ["Bucket", "Hubcap"];
      const incidentTypes = ["Medical", "Theme Camp"];
      const anIncident = new Incident(
        {
          "eventID": eventID,
          "number": number,
          "created": created,
          "state": state,
          "priority": priority,
          "summary": summary,
          "rangerHandles": rangerHandles,
          "incidentTypes": incidentTypes,
        }
      );
      const result = anIncident.toJSON();

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify(
          {
            "event": eventID,
            "number": number,
            "created": created,
            "state": state,
            "priority": priority,
            "summary": summary,
            "location": null,
            "ranger_handles": rangerHandles,
            "incident_types": incidentTypes,
          }
        )
      );
    }
  );

  test(
    "fromJSON, valid", () => {
      const incidentJSON = {
        event: "1",
        number: 1,
        created: "2021-08-17T17:12:46.000-07:00",
        summary: "Vehicle lockout",
        priority: 5,
        state: "closed",
        incident_types: ["Vehicle", "Camp"],
        ranger_handles: ["Bucket", "Hubcap"],
        location: {
          type: "garett",
          name: "Fanstasmo!",
          description: "On B road",
          radial_hour: 8,
          radial_minute: 45,
          concentric: "B",
        },
        // incident_reports: [],
        // report_entries: [
        //   {
        //     system_entry: true,
        //     created: "2020-08-17T17:12:46.000-07:00",
        //     author: "Operator",
        //     text: "Changed description name to: On B road",
        //   },
        //   {
        //     system_entry:false,
        //     created:"2021-08-17T17:23:00.000-07:00",
        //     author:"Operator",
        //     text: "White pickup stopped on road, eventually moved",
        //   },
        //   {
        //     system_entry:true,
        //     created:"2021-08-28T00:37:37.000-07:00",
        //     author:"Operator",
        //     text:"Changed state to: closed",
        //   },
        // ],
      };

      const result = Incident.fromJSON(incidentJSON);
      const resultJSON = result.toJSON();

      expect(resultJSON).toEqual(incidentJSON);
    }
  );

  test(
    "fromJSON, invalid", () => {
      expect(() => Incident.fromJSON({})).toThrow(`Invalid incident JSON: {}`);
    }
  );

  test(
    "stateAsText, valid",
    () => {
      expect(Incident.stateAsText("new")).toEqual("New");
      expect(Incident.stateAsText("on_hold")).toEqual("On Hold");
      expect(Incident.stateAsText("dispatched")).toEqual("Dispatched");
      expect(Incident.stateAsText("on_scene")).toEqual("On Scene");
      expect(Incident.stateAsText("closed")).toEqual("Closed");
    }
  );

  test(
    "stateAsText, invalid",
    () => {
      for (const value of [-1, "XYZZY"]) {
        expect(
          () => Incident.stateAsText(value)
        ).toThrow(`Invalid state: ${value}`)
      }
    }
  );

});
