import Register from "@/app/registro/page";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { AuthProvider } from "@/contexts/AuthContext";

// Mock do next/navigation
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

// Mock da API
jest.mock("@/services/api", () => ({
    api: {
        register: jest.fn(),
        registerOrganization: jest.fn(),
    },
}));

// Mock do next/link
jest.mock("next/link", () => {
    const MockedLink = ({ children, href }: { children: React.ReactNode; href?: string }) => {
        return <a href={href || "#"}>{children}</a>;
    };
    MockedLink.displayName = "MockedLink";
    return MockedLink;
});

function criarUsuarioValido() {
    return {
        name: "Lucas Teste",
        email: "lucas@test.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        phone: "11999999999",
        city: "Santa Rita",
        state: "MG",
        agreedToTerms: true,
    };
}

describe("Página de Registro", () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        jest.clearAllMocks();
    });

    it("deve mostrar mensagens de erro ao tentar enviar o formulário vazio", async () => {
        render(
            <AuthProvider>
                <Register />
            </AuthProvider>
        );

        const botaoCriarConta = screen.getByRole("button", { name: /criar conta/i });
        await userEvent.click(botaoCriarConta);

        await waitFor(() => {
            expect(screen.getByText("O nome deve ter no mínimo 3 caracteres")).toBeInTheDocument();
            expect(screen.getByText("Digite um e-mail válido")).toBeInTheDocument();
            expect(screen.getByText("A senha deve ter no mínimo 8 caracteres")).toBeInTheDocument();
            expect(screen.getByText("Telefone inválido")).toBeInTheDocument();
            expect(screen.getByText("A cidade é obrigatória")).toBeInTheDocument();
            expect(screen.getByText("Selecione um estado")).toBeInTheDocument();
            expect(screen.getByText("Você precisa aceitar os termos de responsabilidade")).toBeInTheDocument();
        });
    });

    it("Deve verificar se as senhas são iguais", async () => {
        render(
            <AuthProvider>
                <Register />
            </AuthProvider>
        );

        await userEvent.type(screen.getByLabelText("Senha"), "Password123!");
        await userEvent.type(screen.getByLabelText("Confirmar senha"), "Diferente123!");
        await userEvent.click(screen.getByRole("button", { name: /criar conta/i }));

        await waitFor(() => {
            expect(screen.getByText("As senhas não coincidem")).toBeInTheDocument();
        });
    });

    it("deve realizar registro com sucesso e redirecionar", async () => {
        const alertMock = jest.spyOn(window, "alert").mockImplementation();
        (api.register as jest.Mock).mockResolvedValue({ id: 1 });
        
        render(
            <AuthProvider>
                <Register />
            </AuthProvider>
        );
        const usuario = criarUsuarioValido();

        await userEvent.type(screen.getByLabelText("Nome completo"), usuario.name);
        await userEvent.type(screen.getByLabelText("E-mail"), usuario.email);
        await userEvent.type(screen.getByLabelText("Senha"), usuario.password);
        await userEvent.type(screen.getByLabelText("Confirmar senha"), usuario.confirmPassword);
        await userEvent.type(screen.getByLabelText("Telefone"), usuario.phone);
        await userEvent.type(screen.getByLabelText("Cidade"), usuario.city);
        await userEvent.selectOptions(screen.getByLabelText("Estado"), usuario.state);
        await userEvent.click(screen.getByRole("checkbox"));

        await userEvent.click(screen.getByRole("button", { name: /criar conta/i }));

        await waitFor(() => {
            expect(api.register).toHaveBeenCalled();
            expect(alertMock).toHaveBeenCalledWith("Conta criada com sucesso! Você já pode fazer login.");
            expect(mockPush).toHaveBeenCalledWith("/login");
        });

        alertMock.mockRestore();
        });

    it("deve realizar registro de ONG com sucesso e redirecionar", async () => {
        const alertMock = jest.spyOn(window, "alert").mockImplementation();
        (api.registerOrganization as jest.Mock).mockResolvedValue({ id: 'org-1' });

        render(
            <AuthProvider>
                <Register />
            </AuthProvider>
        );

        // Clica no toggle "Sou uma ONG"
        await userEvent.click(screen.getByRole("button", { name: /sou uma ong/i }));

        // Preenche dados do responsável
        await userEvent.type(screen.getByLabelText("Nome completo do responsável"), "Admin ONG");
        await userEvent.type(screen.getByLabelText("E-mail"), "admin@ong.com");
        await userEvent.type(screen.getByLabelText("Senha"), "Password123!");
        await userEvent.type(screen.getByLabelText("Confirmar senha"), "Password123!");

        // Preenche dados da ONG
        await userEvent.type(screen.getByLabelText("Nome legal da ONG"), "Instituto Pet Feliz");
        await userEvent.type(screen.getByLabelText("Cidade"), "Santa Rita");
        await userEvent.selectOptions(screen.getByLabelText("Estado"), "MG");

        await userEvent.click(screen.getByRole("button", { name: /cadastrar ong/i }));

        await waitFor(() => {
            expect(api.registerOrganization).toHaveBeenCalled();
            expect(alertMock).toHaveBeenCalledWith("Conta da ONG criada com sucesso! Você já pode fazer login.");
            expect(mockPush).toHaveBeenCalledWith("/login");
        }, { timeout: 10000 });

        alertMock.mockRestore();
    }, 30000);
        });