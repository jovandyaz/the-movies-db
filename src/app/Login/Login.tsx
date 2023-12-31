"use client";

import "./Login.css";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/appHooks";
import { authUser } from "@/store/thunks/authThunk";
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import { CardForm, FormInput } from "../../components";
import { appRoutes } from "@/paths.routes";
import {
  EmailSchemaType,
  PasswordSchemaType,
  emailSchema,
  passwordSchema,
} from "./login.schema";

export const Login = (): ReactElement => {
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, errorMessage } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();
  const [email, setEmail] = useState<EmailSchemaType>("");
  const [emailError, setEmailError] = useState<string>("");
  const [password, setPassword] = useState<PasswordSchemaType>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [isFormCompleted, setIsFormCompleted] = useState<boolean>(false);

  const validateEmail = emailSchema.safeParse(email);
  const validatePassword = passwordSchema.safeParse(password);

  const handleOnChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleOnChangePassword = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPassword(event.target.value);
  };

  const validateForm = useCallback((): boolean => {
    !validateEmail.success
      ? setEmailError(validateEmail.error.issues[0].message)
      : setEmailError("");

    !validatePassword.success
      ? setPasswordError(validatePassword.error.issues[0].message)
      : setPasswordError("");

    if (validateEmail.success && validatePassword.success && termsChecked) {
      return true;
    } else {
      return false;
    }
  }, [termsChecked, validateEmail, validatePassword]);

  const checkIsFormCompleted = useCallback(() => {
    if (email && password && termsChecked) {
      if (validateForm()) {
        setIsFormCompleted(true);
      } else {
        setIsFormCompleted(false);
      }
    } else {
      setIsFormCompleted(false);
    }
  }, [email, validateForm, password, termsChecked]);

  const handleSubmit = () => {
    dispatch(authUser());
  };

  useEffect(() => {
    checkIsFormCompleted();
    if (isAuthenticated) {
      router.push(appRoutes.catalogue);
    } else if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [checkIsFormCompleted, errorMessage, isAuthenticated, router]);

  const eyeIcon = (
    <InputAdornment position="end">
      <IconButton onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <MdOutlineVisibilityOff /> : <MdOutlineVisibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box className="login-form">
      <CardForm
        title="Login"
        subtitle="¡Bienvenido!"
        buttonMessage="Iniciar sesión"
        disabledButton={!isFormCompleted}
        isSubmitting={isLoading}
        onActionButton={handleSubmit}
      >
        <>
          <FormInput
            title="Correo electrónico"
            type="email"
            fieldName="email"
            placeholder="Ingresa tu email"
            warning={emailError}
            onChange={handleOnChangeEmail}
            onSubmit={handleSubmit}
          />

          <FormInput
            title="Contraseña"
            type={showPassword ? "text" : "password"}
            fieldName="confirm-password"
            placeholder="Ingresa tu contraseña"
            endAdornment={eyeIcon}
            warning={passwordError}
            onChange={handleOnChangePassword}
            onSubmit={handleSubmit}
          />

          <FormControlLabel
            className="terms-checkbox"
            control={
              <Checkbox
                checked={termsChecked}
                onChange={(event) => setTermsChecked(event.target.checked)}
              />
            }
            label="He leído y acepto los términos y condiciones"
          />
          <Toaster position="bottom-center" />
        </>
      </CardForm>
    </Box>
  );
};
