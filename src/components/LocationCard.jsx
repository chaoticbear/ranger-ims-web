import invariant from "invariant";

import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";

import RodGarettAddress from "../ims/model/RodGarettAddress";

import FormGroup from "./FormGroup";
import Label from "./Label";
import LabeledTextField from "./LabeledTextField";
import Select from "./Select";
import Well from "./Well";

const LocationCard = ({
  locationName,
  locationDescription,
  locationConcentric,
  locationRadialHour,
  locationRadialMinute,
  concentricStreets,
  setLocationName,
  setLocationDescription,
  setLocationConcentric,
  setLocationRadialHour,
  setLocationRadialMinute,
}) => {
  invariant(setLocationName != null, "setLocationName property is required");
  invariant(
    setLocationDescription != null,
    "setLocationDescription property is required"
  );
  invariant(
    setLocationConcentric != null,
    "setLocationConcentric property is required"
  );
  invariant(
    setLocationRadialHour != null,
    "setLocationRadialHour property is required"
  );
  invariant(
    setLocationRadialMinute != null,
    "setLocationRadialMinute property is required"
  );

  return (
    <Well id="incident_location_card" title="Location">
      <FormGroup as={Row}>
        <Col sm={2}>
          <Label id="incident_location_name" label="Name" />
        </Col>
        <Col sm={10}>
          <LabeledTextField
            id="incident_location_name"
            value={locationName}
            setValue={setLocationName}
            placeholder="Name of location (camp, art project, …)"
          />
        </Col>
      </FormGroup>
      <FormGroup as={Row}>
        <Col sm={2}>
          <Label id="incident_location_address" label="Address" />
        </Col>
        <Col sm={10}>
          <InputGroup id="incident_location_address">
            <Select
              id="incident_location_address_radial_hour"
              width="auto"
              value={locationRadialHour}
              setValue={setLocationRadialHour}
              values={RodGarettAddress.radialHours.map((h) => [h, h])}
            />
            <InputGroup.Text>:</InputGroup.Text>
            <Select
              id="incident_location_address_radial_minute"
              width="5em"
              value={locationRadialMinute}
              setValue={setLocationRadialMinute}
              values={RodGarettAddress.radialMinutes.map((m) => [m, m])}
            />
            <InputGroup.Text>@</InputGroup.Text>
            <Select
              id="incident_location_address_concentric"
              width="20em"
              value={locationConcentric}
              setValue={setLocationConcentric}
              values={Array.from(concentricStreets, ([id, s]) => [id, s.name])}
            />
          </InputGroup>
        </Col>
      </FormGroup>
      <FormGroup as={Row}>
        <Col sm={2}>
          <Label id="incident_location_description" label="Description" />
        </Col>
        <Col sm={10}>
          <LabeledTextField
            id="incident_location_description"
            value={locationDescription}
            setValue={setLocationDescription}
            placeholder="Description of location"
          />
        </Col>
      </FormGroup>
    </Well>
  );
};

export default LocationCard;
