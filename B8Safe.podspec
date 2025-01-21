require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
# folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
Pod::UI.puts "[B8Safe] Obrigado por confiar na B8Safe ❤️"

enableLocation = false
if defined?($B8EnableLocation)
  Pod::UI.puts "[B8Safe] $B8EnableLocation definido como #{$B8EnableLocation}!"
  enableLocation = $B8EnableLocation
else
  Pod::UI.puts "[B8Safe] $B8EnableLocation não definido, CLLocation APIs desabilitado por padrão..."
end

Pod::Spec.new do |s|
  s.name         = "B8Safe"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/brbtcoficial/react-native-b8safe.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  # React Native Core dependency
  # install_modules_dependencies(s)
  s.dependency     'React-Core'
  s.dependency     'VisionCamera'
  s.dependency     'react-native-worklets-core'
end
