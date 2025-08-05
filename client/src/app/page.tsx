import SignInForm from "@/components/features/Auth/SigninForm";

const SignInPage = () => {
  return (
    <div className="container mx-auto">
      <div className="min-h-screen flex items-center justify-center">
        <SignInForm />{" "}
      </div>
    </div>
  );
};

export default SignInPage;

SignInPage.displayName = "SignInPage";
