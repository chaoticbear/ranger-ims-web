import "@testing-library/jest-dom/extend-expect";
import { act, screen } from "@testing-library/react";

import { renderWithIMS, testIncidentManagementSystem } from "../ims/TestIMS";

import Page from "./Page";


describe("Page component", () => {

  test(
    "id",
    async () => {
      await act(async () => {
        renderWithIMS(<Page />, testIncidentManagementSystem());
      });

      expect(document.getElementById("page")).toBeInTheDocument();
    }
  );

  test(
    "includes navigation",
    async () => {
      await act(async () => {
        renderWithIMS(<Page />, testIncidentManagementSystem());
      });

      expect(document.getElementById("page_navigation")).toBeInTheDocument();
    }
  );

  test(
    "includes children",
    async () => {
      const content = "Hello!";

      await act(async () => {
        renderWithIMS(<Page>{content}</Page>, testIncidentManagementSystem());
      });

      expect(screen.queryByText(content)).toBeInTheDocument();
    }
  );

});
