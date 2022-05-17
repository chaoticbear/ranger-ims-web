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
}) => {
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
              width="5em"
              selected={locationRadialHour}
              options={RodGarettAddress.radialHours.map((value) => [
                value,
                value,
              ])}
            />
            <InputGroup.Text>:</InputGroup.Text>
            <Select
              id="incident_location_address_radial_minute"
              width="5em"
              selected={locationRadialMinute}
              options={RodGarettAddress.radialMinutes.map((value) => [
                value,
                value,
              ])}
            />
            <InputGroup.Text>@</InputGroup.Text>
            <Select
              id="incident_location_address_concentric"
              width="20em"
              selected={locationConcentric}
              options={Array.from(concentricStreets, ([id, street]) => [
                street.id,
                street.name,
              ])}
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
            placeholder="Description of location"
          />
        </Col>
      </FormGroup>
    </Well>
  );
};

export default LocationCard;