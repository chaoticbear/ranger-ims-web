import invariant from "invariant";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { IMSContext } from "../ims/context";
import { useEvent } from "../ims/effects";

import Loading from "../components/Loading";
import Page from "../components/Page";
import DispatchQueue from "../components/DispatchQueue";

export const DispatchQueuePage = ({ eventID }) => {
  const imsContext = useContext(IMSContext);
  invariant(imsContext != null, "IMS context is required");
  const ims = imsContext.ims;

  invariant(ims != null, "No IMS");

  // Fetch data

  const [event, setEvent] = useState(undefined);

  useEvent({ eventID: eventID, setEvent: setEvent });

  // Render

  if (event === undefined) {
    return <Loading />;
  } else if (event === null) {
    return "Error loading event";
  }

  return (
    <Page>
      <DispatchQueue event={event} />
    </Page>
  );
};

export const RoutedDispatchQueuePage = () => {
  const params = useParams();

  invariant(
    params.eventID != null,
    "eventID parameter is required: " + JSON.stringify(params)
  );

  return <DispatchQueuePage eventID={params.eventID} />;
};

export default RoutedDispatchQueuePage;
