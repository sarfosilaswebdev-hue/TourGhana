import { TouchableOpacity } from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button = ({ children, onPress, className, disabled }: ButtonProps) => {
  return (
    <TouchableOpacity
      className={`bg-primary rounded-full px-24 py-4 mt-5 items-center ${className} ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Button;