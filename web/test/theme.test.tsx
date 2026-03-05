import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeToggler } from "@/components/theme-toggler";
import "@testing-library/jest-dom/vitest"

describe("Theme Toggler", () => {
    it("renders", () => {
        render(<ThemeToggler />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });
});
