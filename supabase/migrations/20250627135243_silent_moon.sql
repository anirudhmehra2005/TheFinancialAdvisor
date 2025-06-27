/*
  # Fix user_profiles INSERT policy

  1. Security Policy Update
    - Drop the existing INSERT policy that uses incorrect `uid()` function
    - Create new INSERT policy using correct `auth.uid()` function
    - This allows users to insert their own profile during signup

  2. Changes
    - Replace `uid()` with `auth.uid()` in the INSERT policy check condition
    - Ensures proper authentication context for new user profile creation
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create the corrected INSERT policy using auth.uid()
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);