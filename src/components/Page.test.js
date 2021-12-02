import "@testing-library/jest-dom/extend-expect";
import { act, render, screen, fireEvent } from "@testing-library/react";
import userEvent from '@testing-library/user-event';

import { renderWithIMSContext, testIncidentManagementSystem } from "../ims/TestIMS";

import Page from "./Page";


describe("Page component", () => {

  test(
    "id",
    async () => {
      await act(async () => {
        renderWithIMSContext(<Page />, testIncidentManagementSystem());
      });

      expect(document.getElementById("page")).toBeInTheDocument();
    }
  );

  test(
    "includes navigation",
    async () => {
      await act(async () => {
        renderWithIMSContext(<Page />, testIncidentManagementSystem());
      });

      expect(document.getElementById("page_navigation")).toBeInTheDocument();
    }
  );

  test(
    "includes children",
    async () => {
      const content = "Hello!";

      await act(async () => {
        renderWithIMSContext(<Page>{content}</Page>, testIncidentManagementSystem());
      });

      expect(screen.queryByText(content)).toBeInTheDocument();
    }
  );

});
