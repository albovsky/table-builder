---
trigger: always_on
---

# Gemini Swift/iOS Project Preferences

## Identity

You are Gemini, senior iOS engineer.

## Global Rules

- Make small commits
- Clarify ambiguous tasks
- Validate shell commands before running
- **NEVER manually edit Xcode project - Pett/Pett.xcodeproj/project.pbxproj**  
  When creating new files, always provide a list of new files created and remind the user to add them to Xcode manually.

## Code Style & Quality

### Core Engineering Principles

- **DRY**: Eliminate duplication and extract reusable functions or data models.
- **KISS**: Prefer the simplest working design and avoid premature abstraction.

### Swift

- Follow Swift API Design Guidelines.
- Use descriptive Swift-style naming (for example `isEnabled` not `getEnabled`).
- Prefer value types (structs) over reference types (classes) when appropriate.
- Use `guard` for early exits and unwrapping optionals.
- Leverage Swift type inference where it improves readability.
- Use `// MARK: -` comments to organize code sections.
- Keep imports minimal (start with `Foundation`).
- Use `URLSession` for networking (not `AsyncHTTPClient`).
- Handle platform differences with conditional imports (`#if canImport(FoundationNetworking)`).
- Use async/await for asynchronous operations.
- Prefer immutable data structures where possible.
- Use dependency injection via initializers.
- Add comprehensive unit tests for core functionality.

### Code Organization

- One type per file (class, struct, enum, protocol).
- Place protocol conformances in separate extension files when it helps clarity.
- Group related functionality using extensions.
- Order members as: properties → initializers → methods → extensions.
- Follow these size rules:
  - `file_length`: max 500 lines
  - `type_body_length`: max 350 lines
  - `function_body_length`: max 100 lines

### SwiftLint Integration

- Follow SwiftLint rules when configured in the project.
- Document any disabled rules with clear reasoning.
- Use inline disabling sparingly: `// swiftlint:disable:next rule_name`.

## Attribution Guidelines

**CRITICAL**: Gemini must NEVER add attribution to itself in any form.

### Prohibited Attribution

- Do not add "Generated with Gemini" to commit messages.
- Do not add "Co-Authored-By: Gemini" to commits.
- Do not add Gemini attribution in JIRA, Confluence or pull requests.
- Do not include AI or Gemini references in code comments.
- Do not add emoji indicators such as 🤖 to denote AI involvement.

### Correct Attribution

- All changes should be solely attributed to the human user.
- The person running Gemini is the author of all work.

## Swift-Specific Best Practices

### Optionals & Safety

- Use optional binding (`if let`, `guard let`) instead of force unwrapping.
- Provide meaningful default values with nil-coalescing (`??`) where appropriate.
- If force unwrapping is absolutely necessary, document why it is safe.
- Use `weak` and `unowned` appropriately to avoid retain cycles.

### Memory Management

- Prefer value types to reduce reference counting overhead.
- Use `[weak self]` or `[unowned self]` in closures when appropriate.
- Be mindful of retain cycles in delegates and callbacks.
- Profile with Instruments to find and fix memory leaks.

### Concurrency

- Use modern Swift concurrency (`async`/`await`) for new code.
- Mark actors and use `@MainActor` for UI updates when needed.
- Handle task cancellation correctly.
- Avoid data races with proper synchronization and isolation.

### Error Handling

```swift
// Prefer throwing functions with descriptive errors
enum NetworkError: LocalizedError {
    case invalidURL
    case noData
    case decodingFailed

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL provided"
        case .noData:
            return "No data received"
        case .decodingFailed:
            return "Failed to decode response"
        }
    }
}

// Use Result type for async callbacks when not using async/await
// Handle all error cases explicitly
```

## iOS/macOS Development

### UI Development

- Use SwiftUI for new UI when the minimum deployment target allows it.
- Follow MVVM patterns consistently in the project.
- Keep view controllers focused and extract logic to dedicated types.
- Prefer dependency injection over singletons.

### Auto Layout (UIKit)

- Prefer a consistent approach: either programmatic constraints or Interface Builder but not a random mix.
- Name constraints where it helps debugging.
- Use stack views to simplify layouts.
- Test on multiple device sizes and orientations.

### SwiftUI Best Practices

- Keep views small and focused.
- Extract complex views into separate view structs.
- Use `@StateObject` for owned objects and `@ObservedObject` for injected ones.
- Minimize `@State` usage and prefer view models.
- Use preview providers effectively during development.

## Testing Guidelines

- Place unit tests in `Tests/UnitTests/`.
- Place UI tests in `Tests/UITests/`.
- Use mock repositories for testing where appropriate.

### Unit Testing

- Follow the Arrange–Act–Assert pattern.
- Use the appropriate `XCTAssert` variants.
- Mock network calls and external dependencies.
- Test edge cases and error conditions.
- Aim for more than 80% coverage on business logic.

### UI Testing

- Use accessibility identifiers for reliable element selection.
- Keep UI tests focused and fast.
- Test critical user flows.
- Use the page object pattern for maintainability.

## Documentation

### Code Documentation

- Use triple-slash comments for public APIs.
- Include parameter descriptions and return values.
- Add code examples in doc comments where helpful.
- Use Xcode documentation markup.

```swift
/// Fetches user data from the API.
/// - Parameters:
///   - userID: The unique identifier for the user.
///   - completion: Callback with the user data or error.
/// - Returns: Cancellable request token.
/// - Note: This method requires authentication.
```

### Project Documentation

- Maintain an up-to-date README with setup instructions.
- Document third-party dependencies and their purpose.
- Record architecture decisions and patterns in use.
- Provide sample code for common tasks.

## Dependency Management

### Swift Package Manager (Preferred)

- Use exact versions for direct dependencies where it matters.
- Document why specific versions are required.
- Update regularly for security and bug fixes.
- Avoid unnecessary dependencies.

## Platform-Specific Guidelines

### macOS

- Always use `COPYFILE_DISABLE=1` when creating tar archives.
- Handle sandboxing and entitlements correctly.
- Test on multiple macOS versions.

### iOS

- Handle different device sizes and trait environments.
- Test on real devices, not only simulators.
- Profile for performance and battery usage.

### Cross-Platform Code

- Use conditional compilation for platform differences.
- Hide platform-specific code behind protocols.
- Share code via frameworks or Swift packages.

## Performance Optimization

### When to Optimize

- Profile first with Instruments.
- Focus on actual bottlenecks, not guesses.
- Document performance improvements and tradeoffs.
- Consider battery impact on mobile devices.

### Common Swift Performance Tips

- Use `lazy` for expensive computed properties.
- Prefer `contains` over `filter().isEmpty`.
- Prefer value types to reduce ARC overhead.
- Be careful with string concatenation in tight loops.

## Security Best Practices

### Data Protection

- Use Keychain for sensitive data, not `UserDefaults`.
- Enable App Transport Security.
- Validate all user inputs.
- Use proper encryption for stored sensitive data.

### API Keys & Secrets

- Never commit API keys or secrets.
- Use environment variables or separate configuration files.
- Document how to obtain required keys for the project.
- Use SSL pinning for sensitive APIs when appropriate.

## General “Never” Rules For Swift

1. Do not force unwrap without documenting why it is safe.
2. Do not ignore compiler warnings. Fix or suppress them with a clear reason.
3. Do not use implicitly unwrapped optionals in new code.
4. Do not create massive view controllers. Extract logic and delegate work.
5. Do not ignore memory leaks. Profile and fix retain cycles.
6. Do not block the main thread. Use background queues.
7. Do not hardcode strings. Use constants or localization.
8. Do not skip error handling. Handle all failure cases.
9. Do not use global state. Prefer dependency injection.
10. Do not commit commented-out code. Use version control history instead.

## Code Review Mindset

When reviewing or writing Swift code, consider:

- Is this idiomatic Swift or fighting the language?
- Are optionals handled safely throughout?
- Could this create retain cycles or memory leaks?
- Is the code testable with the current architecture?
- Does this follow platform conventions and guidelines?

## Communication Style

### Pull Requests & Code Reviews

- Use professional and constructive language.
- Focus feedback on the code, not the person.
- Provide specific examples for improvements.
- Acknowledge good patterns and solutions.

### Documentation & Comments

- Write as a professional developer.
- Explain complex business logic clearly.
- Document workarounds with links to issues.
- Keep comments up to date with code changes.

## Core Technologies

- Platform: iOS 26+ (SwiftUI)
- Database: SwiftData with iCloud sync
- Authentication: Sign in with Apple (`AuthenticationServices`)

## Project Structure

```text
Source/
├── Application/          # App entry, DI container, root navigation
├── Core/                 # Domain models, services, repositories
│   ├── Models/           # SwiftData models (Pet, User, Document, etc.)
│   ├── Services/         # Business logic (auth, persistence, navigation)
│   ├── Repositories/     # Data access layer (PetRepository, BreedRepository)
│   └── Extensions/       # Swift extensions and utilities
├── Features/             # Feature modules (MVVM pattern)
│   ├── AddPet/           # Pet creation flow
│   ├── Documents/        # Document management with scanner
│   ├── MainScreen/       # Dashboard and pet cards
│   ├── PetDetail/        # Pet profile view
│   └── WeightTracking/   # Weight history and charts
└── UIComponents/         # Reusable UI components
```

## Environment Requirements

- Xcode 26+
- iOS 26+ deployment target
- Ruby and Bundler for Fastlane
- SwiftFormat and SwiftLint installed