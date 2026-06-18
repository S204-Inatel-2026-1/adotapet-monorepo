import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Helper component to test useAuth
const TestComponent = () => {
    const { isAuthenticated, user, login, logout } = useAuth();
    return (
        <div>
            <span data-testid="auth-status">{isAuthenticated ? "authenticated" : "not authenticated"}</span>
            <span data-testid="user-name">{user?.name || "no user"}</span>
            <button onClick={() => login("test-token", { id: "user-1", name: "Test User", email: "test@test.com", role: "adopter" })}>
                Login
            </button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
};

describe("AuthContext", () => {
    beforeEach(() => {
        localStorage.clear();
        // Limpar cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        jest.clearAllMocks();
    });

    it("deve iniciar como não autenticado se não houver token no localStorage", async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId("auth-status")).toHaveTextContent("not authenticated");
    });

    it("deve iniciar como autenticado se houver token e user no localStorage", async () => {
        localStorage.setItem("adotapet_token", "existing-token");
        localStorage.setItem("adotapet_user", JSON.stringify({ id: "user-1", name: "Existing User", email: "ex@test.com", role: "adopter" }));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
        expect(screen.getByTestId("user-name")).toHaveTextContent("Existing User");
    });

    it("deve atualizar estado e cookies ao chamar login", async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText("Login");
        await act(async () => {
            loginButton.click();
        });

        expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated");
        expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
        expect(localStorage.getItem("adotapet_token")).toBe("test-token");
        expect(document.cookie).toContain("adotapet_token=test-token");
    });

    it("deve limpar estado e cookies ao chamar logout", async () => {
        localStorage.setItem("adotapet_token", "existing-token");
        localStorage.setItem("adotapet_user", JSON.stringify({ id: "user-1", name: "User", email: "u@t.com", role: "adopter" }));
        document.cookie = "adotapet_token=existing-token; path=/";

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const logoutButton = screen.getByText("Logout");
        await act(async () => {
            logoutButton.click();
        });

        expect(screen.getByTestId("auth-status")).toHaveTextContent("not authenticated");
        expect(localStorage.getItem("adotapet_token")).toBeNull();
        expect(document.cookie).not.toContain("adotapet_token=existing-token");
    });

    it("deve lançar erro se useAuth for usado fora do AuthProvider", () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => render(<TestComponent />)).toThrow("useAuth must be used within an AuthProvider");

        consoleSpy.mockRestore();
    });
});
