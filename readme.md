# Scan and Delete node_modules recursively

Run as a CLI tool <br/>
Flag -p to give the path of directory to be scanned <br/>
Flag -d to indicate whether to delete the node_modules found in the directory <br/>

**Examples:** <br/>
1. Scan node_modules in desktop
```
scan_nm -p ~/Desktop 
```

2. Scan and delete node_modules in current directory
```
scan_nm -p . -d
```