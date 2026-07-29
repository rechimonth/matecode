import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { DeleteButton } from "../../src/components/DeleteButton";

describe("DeleteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders delete button initially", () => {
    render(<DeleteButton onConfirm={vi.fn()} title="Test task" />);
    expect(screen.getByRole("button", { name: /eliminar tarea: test task/i })).toBeTruthy();
  });

  it("opens confirmation dialog on click", async () => {
    const user = userEvent.setup();
    render(<DeleteButton onConfirm={vi.fn()} title="Test task" />);
    
    await user.click(screen.getByRole("button", { name: /eliminar tarea: test task/i }));
    
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Confirmar eliminación")).toBeTruthy();
    expect(screen.getByText(/test task/i)).toBeTruthy();
  });

  it("calls onConfirm and closes dialog on confirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<DeleteButton onConfirm={onConfirm} title="Test task" />);
    
    await user.click(screen.getByRole("button", { name: /eliminar tarea: test task/i }));
    await user.click(screen.getByRole("button", { name: /eliminar/i }));
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes dialog on cancel", async () => {
    const user = userEvent.setup();
    render(<DeleteButton onConfirm={vi.fn()} title="Test task" />);
    
    await user.click(screen.getByRole("button", { name: /eliminar tarea: test task/i }));
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows loading state during deletion", async () => {
    const user = userEvent.setup();
    let resolveConfirm: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => {
      resolveConfirm = resolve;
    }));
    
    render(<DeleteButton onConfirm={onConfirm} title="Test task" />);
    
    await user.click(screen.getByRole("button", { name: /eliminar tarea: test task/i }));
    await user.click(screen.getByRole("button", { name: /eliminar/i }));
    
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: /eliminando/i })).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: /cancelar/i })).toBeDisabled();
    
    resolveConfirm!();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("shows error message on failure and keeps dialog open", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockRejectedValue(new Error("Network error"));
    render(<DeleteButton onConfirm={onConfirm} title="Test task" />);
    
    await user.click(screen.getByRole("button", { name: /eliminar tarea: test task/i }));
    await user.click(screen.getByRole("button", { name: /eliminar/i }));
    
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Network error")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes dialog on Escape key", async () => {
    const user = userEvent.setup();
    render(<DeleteButton onConfirm={vi.fn()} title="Test task" />);
    
    await user.click(screen.getByRole("button", { name: /eliminar tarea: test task/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes dialog on backdrop click", async () => {
    const user = userEvent.setup();
    render(<DeleteButton onConfirm={vi.fn()} title="Test task" />);
    
    await user.click(screen.getByRole("button", { name: /eliminar tarea: test task/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("disables initial button when disabled prop is true", () => {
    render(<DeleteButton onConfirm={vi.fn()} title="Test task" disabled />);
    expect(screen.getByRole("button", { name: /eliminar tarea: test task/i })).toBeDisabled();
  });
});
