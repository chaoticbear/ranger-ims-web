import { screen } from "@testing-library/react";

import {
  renderWithIMSContext,
  testIncidentManagementSystem,
} from "../ims/TestIMS";
import { waitForElementNotToBePresent } from "../test/wait";
import BagTable from "./BagTable";

export const waitForURLBag = async () => {
  await waitForElementNotToBePresent(() =>
    screen.queryByText("Loading URL bag…"),
  );
};

describe("BagTable component", () => {
  test("id", async () => {
    renderWithIMSContext(<BagTable />, testIncidentManagementSystem());
    await waitForURLBag();

    expect(document.getElementById("bag_table")).toBeInTheDocument();
  });

  test("caption", async () => {
    renderWithIMSContext(<BagTable />, testIncidentManagementSystem());
    await waitForURLBag();

    expect(await screen.findByText("IMS Bag")).toBeInTheDocument();
  });

  test("loading bag", async () => {
    renderWithIMSContext(<BagTable />, testIncidentManagementSystem());
    expect(screen.getByText("Loading URL bag…")).toBeInTheDocument();
    await waitForURLBag();
  });

  test("bag fails to load", async () => {
    const ims = testIncidentManagementSystem();

    ims.bag = jest.fn(async () => {
      throw new Error("because reasons...");
    });
    console._suppressErrors();

    const spy = jest.spyOn(console, "warn");

    renderWithIMSContext(<BagTable />, ims);
    await waitForURLBag();

    expect(
      await screen.findByText("Failed to load URL bag."),
    ).toBeInTheDocument();

    expect(console.info).toHaveBeenCalledWith(
      "Unable to fetch bag: because reasons...",
    );
  });

  test("loaded bag", async () => {
    const ims = testIncidentManagementSystem();

    renderWithIMSContext(<BagTable />, ims);

    for (const name in ims.testData.bag.urls) {
      expect(await screen.findByText(name)).toBeInTheDocument();
    }
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });

  // test("no urls in bag", async () => {
  //   const ims = testIncidentManagementSystem();
  //   ims.testData.bag = {};

  //   renderWithIMSContext(<BagTable />, ims);

  //   expect(
  //     await screen.findByText("ERROR: no URLs in bag")
  //   ).toBeInTheDocument();
  // });

  // test("null urls in bag", async () => {
  //   const ims = testIncidentManagementSystem();
  //   ims.testData.bag = { urls: null };

  //   renderWithIMSContext(<BagTable />, ims);

  //   expect(
  //     await screen.findByText("ERROR: no URLs in bag")
  //   ).toBeInTheDocument();
  // });
});
