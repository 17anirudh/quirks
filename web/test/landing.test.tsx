import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest"
import { AppComponent } from "@/routes";

const text: string = `Breaking the silence of the "anonymous masses" of the industrial age, these platforms were praised for giving every person a digital canvas to broadcast their unique quirks and talents, transforming the internet into a decentralized library of human identity where every "misfit" could finally find their kindred spirits.` as const

describe("Landing page", () => {
    it("renders", () => {
        render(<AppComponent />);
        expect(screen.getByText("Quirks")).toBeInTheDocument();
        expect(screen.getByText(text)).toBeInTheDocument();
    });
});
