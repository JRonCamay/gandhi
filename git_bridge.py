import subprocess
import os

class GitBridge:
    """A flexible bridge to interact with local Git repositories."""

    @staticmethod
    def run_command(command, repo_path):
        """
        Executes a git command in the target repository.
        Returns a tuple: (success_boolean, output_string)
        """
        if not os.path.exists(repo_path):
            return False, f"Error: Repository path does not exist: {repo_path}"

        try:
            # Using run with capture_output ensures we get stdout and stderr
            # regardless of whether the command succeeds or fails.
            result = subprocess.run(
                ['git'] + command,
                cwd=repo_path,
                capture_output=True,
                text=True,
                check=True # Raises CalledProcessError on non-zero exit
            )
            return True, result.stdout.strip()
        
        except subprocess.CalledProcessError as e:
            # We catch the exception and return the stderr content safely
            # No more 'NoneType' errors here.
            error_msg = e.stderr.strip() if e.stderr else str(e)
            return False, f"Git Error: {error_msg}"
        
        except Exception as e:
            return False, f"System Error: {str(e)}"

# Example usage pattern for your API endpoint:
def handle_git_request(data):
    repo = data.get("repo")
    message = data.get("message", "Auto-commit")
    
    # 1. Add
    success, out = GitBridge.run_command(['add', '.'], repo)
    if not success: return {"error": out}
    
    # 2. Commit
    success, out = GitBridge.run_command(['commit', '-m', message], repo)
    if not success: return {"error": out}
    
    # 3. Push
    success, out = GitBridge.run_command(['push'], repo)
    if not success: return {"error": out}
    
    return {"status": "success", "message": "Changes pushed successfully."}