import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../constants/colors";
import {
  login,
  register,
  resetPassword,
  updatePassword,
  verifyResetOtp,
} from "../services/backupService";

export default function AuthModal({ visible, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState("email"); // email, otp, password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleAuth = async () => {
    if (!email || (!isForgotPassword && !password)) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (isForgotPassword) {
        if (forgotStep === "email") {
          const { error: resetError } = await resetPassword(email);
          if (resetError) {
            setError(resetError.message);
          } else {
            setMessage("Verification code sent to your email.");
            setForgotStep("otp");
          }
        } else if (forgotStep === "otp") {
          const { data, error: verifyError } = await verifyResetOtp(
            email.trim(),
            otp.trim(),
          );
          if (verifyError) {
            setError(verifyError.message);
          } else {
            setError("");
            setMessage(
              "Code verified! You are now logged in. Set your new password.",
            );
            setUser(data.user);
            setForgotStep("password");
          }
        } else if (forgotStep === "password") {
          const { error: updateError } = await updatePassword(newPassword);
          if (updateError) {
            setError(updateError.message);
          } else {
            onAuthSuccess(user);
            onClose();
          }
        }
      } else {
        const { data, error: authError } = isLogin
          ? await login(email, password)
          : await register(email, password);

        if (authError) {
          setError(authError.message);
        } else {
          onAuthSuccess(data.user);
          onClose();
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isForgotPassword
                ? forgotStep === "email"
                  ? "Reset Password"
                  : forgotStep === "otp"
                    ? "Enter Code"
                    : "New Password"
                : isLogin
                  ? "Welcome Back"
                  : "Create Account"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {isForgotPassword
              ? forgotStep === "email"
                ? "Enter your email to receive a verification code."
                : forgotStep === "otp"
                  ? "Enter the 8-digit code sent to your email."
                  : "Enter your new password below."
              : isLogin
                ? "Login to sync your words to the cloud."
                : "Register to start backing up your words."}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {message ? <Text style={styles.successText}>{message}</Text> : null}

          {(!isForgotPassword || forgotStep === "email") && (
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          {isForgotPassword && forgotStep === "otp" && (
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="numeric"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="8-digit code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={8}
              />
            </View>
          )}

          {isForgotPassword && forgotStep === "password" && (
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}

          {!isForgotPassword && (
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}

          {isLogin && !isForgotPassword && (
            <TouchableOpacity
              onPress={() => setIsForgotPassword(true)}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.authButton, loading && styles.disabledButton]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.authButtonText}>
                {isForgotPassword
                  ? forgotStep === "email"
                    ? "Send Code"
                    : forgotStep === "otp"
                      ? "Verify Code"
                      : "Update Password"
                  : isLogin
                    ? "Login"
                    : "Register"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isForgotPassword
                ? "Remember your password? "
                : isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (isForgotPassword) {
                  if (forgotStep === "email") {
                    setIsForgotPassword(false);
                  } else if (forgotStep === "otp") {
                    setForgotStep("email");
                  } else {
                    setForgotStep("otp");
                  }
                } else {
                  setIsLogin(!isLogin);
                }
                setError("");
                setMessage("");
              }}
            >
              <Text style={styles.toggleText}>
                {isForgotPassword ? "Login" : isLogin ? "Register" : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: 8,
  },
  authButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  authButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  toggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  successText: {
    color: colors.success || "#4CAF50",
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
