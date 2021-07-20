import "@testing-library/jest-dom/extend-expect";
import { act, render, screen } from "@testing-library/react";

import { renderWithIMS, testIncidentManagementSystem } from "../ims/TestIMS";

import NotFoundPage from "./NotFoundPage";


describe("NotFoundPage component", () => {

  test(
    "not found", async () => {
      await act(async () => {
        renderWithIMS(<NotFoundPage />, testIncidentManagementSystem());
      });

      expect(screen.queryByText("Resource not found:")).toBeInTheDocument();
      expect(screen.queryByText(window.location.href)).toBeInTheDocument();
    }
  );

});
