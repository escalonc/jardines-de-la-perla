import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn
        withSignUp={false}
        appearance={{
          elements: {
            formFieldInput: {
              "&::placeholder": {
                color: "transparent",
              },
            },
          },
        }}
      />
    </div>
  );
}
