import { AccountDAODatabase, AccountDAOMemory } from "../src/AccountDAO";
import GetAccount from "../src/GetAccounts";
import { MailerGatewayMemory } from "../src/MailerGateway";
import Signup from "../src/Signup";
import sinon from "sinon";

let signup: Signup;
let getAccount: GetAccount;

beforeEach(() => {
  const accountDAO = new AccountDAODatabase();
  //const accountDAO = new AccountDAOMemory();
  const mailerGateway = new MailerGatewayMemory();
  signup = new Signup(accountDAO, mailerGateway);
  getAccount = new GetAccount(accountDAO);
});

test("Deve criar a conta do usuário", async function () {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "13299111485",
    password: "123456",
    isPassenger: true
  };  
  const outputSignup = await signup.execute(input);
  expect(outputSignup.accountId).toBeDefined();
  const outputGetAccount = await getAccount.execute(outputSignup.accountId);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.cpf).toBe(input.cpf);
  expect(outputGetAccount.password).toBe(input.password);
  //expect(outputGetAccount.isPassenger).toBe(input.isPassenger);
});

test("Não deve criar a conta de um usuário já existente", async function () {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "13299111485",
    password: "123456",
    isPassenger: true
  };
  await signup.execute(input);
  await expect(() => signup.execute(input)).rejects.toThrow(new Error("Duplicated account"));
});

test("Não deve criar a conta de um usuário com nome inválido", async function () {
  const input = {
    name: "John",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "13299111485",
    password: "123456",
    isPassenger: true
  };
  await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid name"));
});

test("Não deve criar a conta de um usuário com email inválido", async function () {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}gmail.com`,
    cpf: "13299111485",
    password: "123456",
    isPassenger: true
  };
  await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid email"));
});

test("Não deve criar a conta de um usuário com cpf inválido", async function () {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "13299111488",
    password: "123456",
    isPassenger: true
  };
  await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid cpf"));
});


test("Não deve criar a conta de um motorista com placa inválida", async function () {
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "13299111485",
    password: "123456",
    carPlate: "ABC1A234",
    isDriver: true
  };
  await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid car plate"));
});

test("Deve criar a conta de um passageiro com Stub", async function () {
  const mailerStub = sinon.stub(MailerGatewayMemory.prototype, "send").resolves();
  const getAccountByEmail = sinon.stub(AccountDAODatabase.prototype, "getAccountByEmail").resolves();
  const input = {
    name: "John Doe",
    email: `john.doe@gmail.com`,
    cpf: "13299111485",
    password: "123456",
    isPassenger: true
  };  
  const outputSignup = await signup.execute(input);
  expect(outputSignup.accountId).toBeDefined();
  const outputGetAccount = await getAccount.execute(outputSignup.accountId);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.cpf).toBe(input.cpf);
  expect(outputGetAccount.password).toBe(input.password);
  //expect(outputGetAccount.isPassenger).toBe(input.isPassenger);
  mailerStub.restore();
  getAccountByEmail.restore();
});

test("Deve criar a conta de um passageiro com spy", async function () {
  const mailerSpy = sinon.spy(MailerGatewayMemory.prototype, "send");
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "13299111485",
    password: "123456",
    isPassenger: true
  };  
  const outputSignup = await signup.execute(input);
  expect(outputSignup.accountId).toBeDefined();
  const outputGetAccount = await getAccount.execute(outputSignup.accountId);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.cpf).toBe(input.cpf);
  expect(outputGetAccount.password).toBe(input.password);
  //expect(outputGetAccount.isPassenger).toBe(input.isPassenger);
  expect(mailerSpy.calledWith(input.email, "Bem-vindo ao nosso sistema!", "...")).toBe(true);
  mailerSpy.restore();
});

test("Deve criar a conta de um passageiro com mock", async function () {
  const mailerMock = sinon.mock(MailerGatewayMemory.prototype);
  const input = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "13299111485",
    password: "123456",
    isPassenger: true
  };  
  mailerMock.expects("send").once().withArgs(input.email, "Bem-vindo ao nosso sistema!", "...").callsFake(() => {
    console.log("Mocked");
  });
  const outputSignup = await signup.execute(input);
  expect(outputSignup.accountId).toBeDefined();
  const outputGetAccount = await getAccount.execute(outputSignup.accountId);
  expect(outputGetAccount.name).toBe(input.name);
  expect(outputGetAccount.email).toBe(input.email);
  expect(outputGetAccount.cpf).toBe(input.cpf);
  expect(outputGetAccount.password).toBe(input.password);
  //expect(outputGetAccount.isPassenger).toBe(input.isPassenger);
  mailerMock.verify();
  mailerMock.restore;
});