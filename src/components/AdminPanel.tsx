import React, { useState, useEffect } from "react";
import { 
  Lock, AlertTriangle, ShieldCheck, Database, RefreshCw, Trash2, 
  Plus, Edit3, Save, CheckCircle, Clock, Undo, Eye, User, FileText, Globe, Flame,
  UploadCloud, FileCode, Terminal, Download, Activity, ShieldAlert, Github
} from "lucide-react";
import { 
  db, 
  handleFirestoreError, 
  OperationType,
  storage,
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  addDoc, 
  writeBatch,
  query,
  orderBy,
  clientSideAdminAuth,
  isSessionValid,
  logoutAdmin,
  sha256
} from "../lib/firebase";

interface AdminPanelProps {
  accentColor: "green" | "cyan" | "purple" | "amber";
  onBackToApp: () => void;
}

export default function AdminPanel({ accentColor, onBackToApp }: AdminPanelProps) {
  // Auth state
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"hero" | "projects" | "skills" | "messages" | "backups" | "cv" | "telemetry" | "devops">("hero");

  // CV system states
  const [activeCV, setActiveCV] = useState<any>(null);
  const [cvVersions, setCvVersions] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cvError, setCvError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  // Security Hardening and firewall simulation state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [intrusionAttempts, setIntrusionAttempts] = useState<any[]>([
    { id: "int-1", timestamp: "13:12:04", ip: "185.220.101.5", route: "/api/admin/auth", payload: "SQLi 'OR 1=1", status: "BLOCKED", risk: "HIGH" },
    { id: "int-2", timestamp: "12:55:18", ip: "91.240.118.15", route: "/wp-admin", payload: "Brute Force Scanning", status: "KICKED", risk: "MEDIUM" },
    { id: "int-3", timestamp: "11:34:52", ip: "103.114.39.27", route: "/config", payload: "Traversal Payload", status: "SHUNNED", risk: "CRITICAL" }
  ]);
  const [cspStatus, setCspStatus] = useState("ENFORCED");
  const [firewallStatus, setFirewallStatus] = useState("ACTIVE");

  // CMS Content States
  const [heroConfig, setHeroConfig] = useState({
    heroName: "Ismail Ibne Ratul",
    heroTitle: "CYBER SECURITY SPECIALIST | CREATIVE DEVELOPER",
    heroBio: "A passionate Bangladeshi tech enthusiast exploring penetration testing, Linux configuration scripts, machine learning neural models, adaptive user-integ layouts, and modern full-stack infrastructures from Savar, Dhaka.",
    typingTags: "CYBER SECURITY SPECIALIST, CREATIVE DEVELOPER, FUTURISTIC SYSTEM ARCHITECT, LINUX POWER USER"
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // GitHub Cloud Sync States
  const [ghToken, setGhToken] = useState(() => localStorage.getItem("ratul_gh_token") || "");
  const [ghRepo, setGhRepo] = useState(() => localStorage.getItem("ratul_gh_repo") || "iir20/ratul-cyber-deck");
  const [ghBranch, setGhBranch] = useState(() => localStorage.getItem("ratul_gh_branch") || "main");

  useEffect(() => {
    localStorage.setItem("ratul_gh_token", ghToken);
  }, [ghToken]);

  useEffect(() => {
    localStorage.setItem("ratul_gh_repo", ghRepo);
  }, [ghRepo]);

  useEffect(() => {
    localStorage.setItem("ratul_gh_branch", ghBranch);
  }, [ghBranch]);

  // Telemetry Metrics
  const [visitorCount, setVisitorCount] = useState(1337);
  const [malwareBlocks, setMalwareBlocks] = useState(242);
  const [activeAnomalies, setActiveAnomalies] = useState(0);
  const [activeMapDivision, setActiveMapDivision] = useState("Dhaka (Savar)");

  // Editing Forms States
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [editingSkill, setEditingSkill] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Throttling countdown timer for failed logins
  useEffect(() => {
    if (lockoutTimeLeft > 0) {
      const timer = setTimeout(() => {
        setLockoutTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimeLeft]);

  // Restore session token if valid
  useEffect(() => {
    const restoreSession = async () => {
      const valid = await isSessionValid();
      if (valid) {
        setIsAuthenticated(true);
      }
    };
    restoreSession();
  }, []);

  // Load CMS Data on Authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchCMSData();
      logActivity("Authentication handshake", "SUCCESS", "Admin session initialized");
    }
  }, [isAuthenticated]);

  // Activity logger helper
  const logActivity = (type: string, status: "SUCCESS" | "WARN" | "CRITICAL", message: string) => {
    const newLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      status,
      message
    };
    setActivityLogs((prev) => [newLog, ...prev].slice(0, 30));
  };

  // ----------------------------------------------------
  // AUTHENTICATION LOGIC FLOW
  // ----------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;
    
    setIsLoading(true);
    setAuthError("");

    try {
      const data = await clientSideAdminAuth(password);

      if (data.success) {
        setIsAuthenticated(true);
        setFailedAttempts(0);
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setAuthError(data.error || "Unaligned coordinates matching handshake.");
        
        // Throttling logic - freeze attempts for 30s after 3 fails
        if (nextAttempts >= 3) {
          setLockoutTimeLeft(30);
          setAuthError("CRITICAL EXCEPTION: Multiple unauthorized queries. Session frozen for 30 seconds.");
          logActivity("IPS Threat Trigger", "CRITICAL", "Three consecutive failed logins from Admin console");
        } else {
          logActivity("Handshake Miss", "WARN", `Failed session query attempt (${nextAttempts}/3)`);
        }
      }
    } catch (err) {
      setAuthError("Handshake logic crashed. Check console protocols.");
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // FIRESTORE SYNC & ACTIONS
  // ----------------------------------------------------
  const fetchCMSData = async () => {
    try {
      // 1. Fetch Config
      const configDoc = await getDoc(doc(db, "portfolio", "config"));
      if (configDoc.exists()) {
        const data = configDoc.data();
        setHeroConfig({
          heroName: data.heroName || "Ismail Ibne Ratul",
          heroTitle: data.heroTitle || "CYBER SECURITY SPECIALIST",
          heroBio: data.heroBio || "",
          typingTags: data.skills ? data.skills.join(", ") : "CYBER SECURITY SPECIALIST"
        });
      }

      // 2. Fetch Projects
      const projectsSnap = await getDocs(collection(db, "projects"));
      const projList = projectsSnap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
      setProjects(projList);

      // 3. Fetch Skills & Contacts
      const skillsSnap = await getDocs(collection(db, "skills"));
      const skillList = skillsSnap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
      setSkills(skillList);

      const msgsSnap = await getDocs(collection(db, "contacts"));
      const msgsList = msgsSnap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
      setMessages(msgsList);

      // 4. Fetch Snap Backups
      const snapSnap = await getDocs(collection(db, "backups"));
      const snapsList = snapSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSnapshots(snapsList);

      // 5. Fetch CV Metadata
      const cvDoc = await getDoc(doc(db, "portfolio", "cv"));
      if (cvDoc.exists()) {
        const data = cvDoc.data();
        setActiveCV({
          fileName: data.fileName || "Ismail_Ibne_Ratul_CV.pdf",
          fileSize: data.fileSize || 124000,
          version: data.version || 1,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          downloadUrl: data.downloadUrl || "",
          contentType: data.contentType || "application/pdf"
        });
        if (data.versionsHistory) {
          setCvVersions(data.versionsHistory);
        }
      } else {
        // Fallback default mock CV configuration for instant fidelity
        const initCV = {
          fileName: "Ismail_Ibne_Ratul_CV_Primary.pdf",
          fileSize: 1048576,
          version: 1,
          lastUpdated: new Date().toISOString(),
          downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          contentType: "application/pdf"
        };
        setActiveCV(initCV);
        setCvVersions([
          { version: 1, fileName: "Ismail_Ibne_Ratul_CV_Primary.pdf", lastUpdated: new Date().toISOString(), fileSize: 1048576 }
        ]);
      }

    } catch (err) {
      console.warn("Firestore collection seeded, preparing fallback synchronizers.");
    }
  };

  // Save Hero config
  const handleSaveHero = async () => {
    setSaveStatus("SAVING...");
    try {
      const payload = {
        heroName: heroConfig.heroName,
        heroTitle: heroConfig.heroTitle,
        heroBio: heroConfig.heroBio,
        skills: heroConfig.typingTags.split(",").map(t => t.trim()),
        themeColor: accentColor,
        animationsActive: true
      };
      
      await setDoc(doc(db, "portfolio", "config"), payload);
      setSaveStatus("SAVED OK");
      logActivity("CMS Hero Edit", "SUCCESS", "Hero configuration parameters synced to Firestore");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "portfolio/config");
    }
  };

  // CV Upload logic
  const handleCVUpload = async (file: File) => {
    setCvError("");
    setUploadProgress(0);
    setIsUploading(true);
    setSelectedFileName(file.name);

    // 1. Cybersecurity MIME/Type check validation
    if (file.type !== "application/pdf") {
      setCvError("CRITICAL EXCEPTION: SECURITY GATEWAY BLOCKED NON-PDF TRANSMISSION. ONLY MIME APPLICATION/PDF ACCEPTED.");
      setIsUploading(false);
      logActivity("IPS Firewall Block", "CRITICAL", `Blocked malicious payload attachment check on file: "${file.name}" (MIME: ${file.type})`);
      
      // Inject alert intrusion simulator log
      setIntrusionAttempts(prev => [
        {
          id: `int-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          ip: "103.114.39.26",
          route: "/api/admin/cv-upload",
          payload: `Malicious attachment type bypass: "${file.name}"`,
          status: "SHUNNED_DROP",
          risk: "HIGH"
        },
        ...prev
      ]);
      return;
    }

    // 2. File size validator - 5MB limit
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setCvError("EXCEPTION: File size violates payload specifications. Limits capped at 5.0 MB.");
      setIsUploading(false);
      logActivity("Buffer Limit Breach", "WARN", `Rejected file "${file.name}" exceeding 5MB`);
      return;
    }

    logActivity("CV Transmitting Initialized", "SUCCESS", `Parsing safe file segmentations for "${file.name}"`);

    // Simulated streaming packets for progress bar visual feedback + real-time progress hologram
    let elapsed = 0;
    const interval = setInterval(async () => {
      elapsed += 10;
      setUploadProgress(elapsed);
      if (elapsed >= 100) {
        clearInterval(interval);
        
        try {
          // Convert to Base64 to support both Firestore backup & instant preview capability
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64String = e.target?.result as string;
            
            // Build new CV state
            const nextVersion = (activeCV?.version || 0) + 1;
            const updatedCV = {
              fileName: file.name,
              fileSize: file.size,
              version: nextVersion,
              lastUpdated: new Date().toISOString(),
              downloadUrl: base64String || "",
              contentType: file.type
            };

            const updatedHistory = [
              {
                version: nextVersion,
                fileName: file.name,
                lastUpdated: new Date().toISOString(),
                fileSize: file.size
              },
              ...(cvVersions || [])
            ].slice(0, 5); // Keep last 5 history items

            // Commit CV to Firestore /portfolio/cv
            await setDoc(doc(db, "portfolio", "cv"), {
              ...updatedCV,
              versionsHistory: updatedHistory
            });

            setActiveCV(updatedCV);
            setCvVersions(updatedHistory);
            setIsUploading(false);
            logActivity("CV File Comitted", "SUCCESS", `Seeded new Version ${nextVersion} dynamically into Cloud Cluster`);
          };
          reader.readAsDataURL(file);
        } catch (err: any) {
          setCvError("Handshake with Firestore cluster collapsed during write cycle.");
          setIsUploading(false);
          logActivity("DB Upload Fail", "CRITICAL", err?.message || "Persistence crashed");
        }
      }
    }, 150);
  };

  const handleDeleteCV = async () => {
    if (!confirm("Are you sure you want to decommission the active CV attachments from the live cloud nodes?")) return;
    setSaveStatus("DELETING CV...");
    try {
      await deleteDoc(doc(db, "portfolio", "cv"));
      setActiveCV(null);
      setCvVersions([]);
      setSaveStatus("CV DELETED");
      logActivity("CV Decommmissioned", "WARN", "Active CV document deleted from live cloud nodes");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      logActivity("CV Decommission Fail", "CRITICAL", err.message || "Database write error");
    }
  };

  // Create Project CRUD
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("WRITING REPO...");
    try {
      if (editingProject.firestoreId) {
        // Update existing
        await setDoc(doc(db, "projects", editingProject.firestoreId), editingProject);
        logActivity("CMS Project Update", "SUCCESS", `Project "${editingProject.title}" parameters patched`);
      } else {
        // Add new
        const { firestoreId, ...newProj } = editingProject;
        await addDoc(collection(db, "projects"), newProj);
        logActivity("CMS Project Create", "SUCCESS", `Project "${editingProject.title}" compiled in database`);
      }
      setEditingProject(null);
      setSaveStatus("SUCCESS");
      fetchCMSData();
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "projects");
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Confirm deletion of Project: "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      logActivity("CMS Project Delete", "WARN", `Project "${name}" decommissioned`);
      fetchCMSData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
  };

  // Skills CRUD
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill.firestoreId) {
        await setDoc(doc(db, "skills", editingSkill.firestoreId), editingSkill);
        logActivity("CMS Skill Matrix Patch", "SUCCESS", `Skill "${editingSkill.name}" weight changed`);
      } else {
        const { firestoreId, ...newSkill } = editingSkill;
        await addDoc(collection(db, "skills"), newSkill);
        logActivity("CMS Skill Matrix Append", "SUCCESS", `Skill "${editingSkill.name}" connected`);
      }
      setEditingSkill(null);
      fetchCMSData();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "skills");
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, "skills", id));
      logActivity("CMS Skill Delete", "WARN", `Skill "${name}" removed from metrics`);
      fetchCMSData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `skills/${id}`);
    }
  };

  // Contacts message purge
  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "contacts", id));
      logActivity("Secure Comms Deleted", "WARN", `Transmission packet "${id}" purged`);
      fetchCMSData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contacts/${id}`);
    }
  };

  // Backup snapshot capture
  const handleCreateSnapshot = async () => {
    setSaveStatus("CAPTURING SNAPSHOT...");
    try {
      const snapId = `snap-${new Date().getTime()}`;
      const payload = {
        name: `Cyber_Core_Snapshot_${new Date().toLocaleDateString()}`,
        timestamp: new Date().toLocaleString(),
        heroConfig,
        projects: projects.map(({ firestoreId, ...rest }) => rest),
        skills: skills.map(({ firestoreId, ...rest }) => rest)
      };

      await setDoc(doc(db, "backups", snapId), payload);
      setSaveStatus("SNAPSHOT SECURED");
      logActivity("DevOps Backup Snapshot", "SUCCESS", `Snapshot image "${payload.name}" committed`);
      fetchCMSData();
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `backups`);
    }
  };

  // Restore snapshot revert
  const handleRestoreSnapshot = async (snap: any) => {
    if (!confirm(`CAUTION: Overwrite full database records with: "${snap.name}"?`)) return;
    setSaveStatus("REVERTING DATA...");
    try {
      const batch = writeBatch(db);

      // 1. Revert Hero Config
      const heroRef = doc(db, "portfolio", "config");
      batch.set(heroRef, {
        heroName: snap.heroConfig.heroName,
        heroTitle: snap.heroConfig.heroTitle,
        heroBio: snap.heroConfig.heroBio,
        skills: snap.heroConfig.typingTags.split(",").map((t: string) => t.trim()),
        themeColor: accentColor,
        animationsActive: true
      });

      // 2. Clear current & write projects
      projects.forEach((proj) => {
        if (proj.firestoreId) {
          batch.delete(doc(db, "projects", proj.firestoreId));
        }
      });
      snap.projects.forEach((proj: any) => {
        const newRef = doc(collection(db, "projects"));
        batch.set(newRef, proj);
      });

      // 3. Clear current & write skills
      skills.forEach((sk) => {
        if (sk.firestoreId) {
          batch.delete(doc(db, "skills", sk.firestoreId));
        }
      });
      snap.skills.forEach((sk: any) => {
        const newRef = doc(collection(db, "skills"));
        batch.set(newRef, sk);
      });

      await batch.commit();
      setSaveStatus("REVERSION COMPLETE");
      logActivity("DevOps Database Reversion", "CRITICAL", `System keys reverted to snapshot "${snap.name}" successfully`);
      fetchCMSData();
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "batch-restore");
    }
  };

  // GitHub Backup Synchronizer Push CMS to GitHub contents
  const handlePushToGitHub = async () => {
    if (!ghToken || !ghRepo) {
      alert("Please establish proper GitHub Personal Access Token (PAT) and repository endpoints first.");
      return;
    }
    setSaveStatus("PUSHING TO GITHUB...");
    try {
      const headers = {
        Authorization: `token ${ghToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      };

      const fullCMSState = {
        heroConfig,
        projects,
        skills,
        activeCV,
        cvVersions,
        timestamp: new Date().toISOString()
      };

      const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(fullCMSState, null, 2))));
      
      let fileSha = "";
      const path = "portfolio-data/cms-backup.json";
      const getRes = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${path}?ref=${ghBranch}`, { headers });
      if (getRes.ok) {
        const existingFile = await getRes.json();
        fileSha = existingFile.sha;
      }

      const putBody: any = {
        message: "Sync CMS database backup snapshot [Serverless Admin]",
        content: contentBase64,
        branch: ghBranch
      };
      if (fileSha) {
        putBody.sha = fileSha;
      }

      const putRes = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${path}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(putBody)
      });

      if (putRes.ok) {
        setSaveStatus("GITHUB SYNC OK");
        logActivity("GitHub Backup Push", "SUCCESS", `Synchronized CMS portfolio settings payload to repository ${ghRepo}`);
        alert(`SUCCESS: CMS metadata backup snapshot synced and committed successfully into repository branch: ${ghBranch}!`);
      } else {
        const errData = await putRes.json();
        throw new Error(errData.message || "GitHub API write blocked");
      }
    } catch (err: any) {
      alert("GitHub Synchronizer collapsed: " + err.message);
      logActivity("GitHub Sync Fail", "CRITICAL", err.message);
    } finally {
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // GitHub Backup Synchronizer Pull CMS from GitHub contents
  const handlePullFromGitHub = async () => {
    if (!ghToken || !ghRepo) {
      alert("Please establish proper GitHub Personal Access Token (PAT) and repository endpoints first.");
      return;
    }
    if (!confirm("WARNING: Pulling from GitHub will overwrite all currently saved portfolio contents in your local IndexedDB. Proceed?")) return;
    setSaveStatus("PULLING FROM GITHUB...");
    try {
      const headers = {
        Authorization: `token ${ghToken}`,
        Accept: "application/vnd.github.v3+json"
      };

      const path = "portfolio-data/cms-backup.json";
      const res = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${path}?ref=${ghBranch}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const decoded = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ""))));
        const parsed = JSON.parse(decoded);

        if (parsed.heroConfig) {
          setHeroConfig(parsed.heroConfig);
          await setDoc(doc(db, "portfolio", "config"), {
            heroName: parsed.heroConfig.heroName,
            heroTitle: parsed.heroConfig.heroTitle,
            heroBio: parsed.heroConfig.heroBio,
            skills: parsed.heroConfig.typingTags.split(",").map((t: string) => t.trim()),
            themeColor: accentColor,
            animationsActive: true
          });
        }

        if (parsed.projects) {
          const batch = writeBatch(db);
          projects.forEach(p => {
            if (p.firestoreId) {
              batch.delete(doc(db, "projects", p.firestoreId));
            }
          });
          parsed.projects.forEach((p: any) => {
            const newRef = doc(collection(db, "projects"));
            batch.set(newRef, p);
          });
          await batch.commit();
          setProjects(parsed.projects);
        }

        if (parsed.skills) {
          const batch = writeBatch(db);
          skills.forEach(s => {
            if (s.firestoreId) {
              batch.delete(doc(db, "skills", s.firestoreId));
            }
          });
          parsed.skills.forEach((s: any) => {
            const newRef = doc(collection(db, "skills"));
            batch.set(newRef, s);
          });
          await batch.commit();
          setSkills(parsed.skills);
        }

        if (parsed.activeCV) {
          setActiveCV(parsed.activeCV);
          setCvVersions(parsed.cvVersions || []);
          await setDoc(doc(db, "portfolio", "cv"), {
            ...parsed.activeCV,
            versionsHistory: parsed.cvVersions || []
          });
        }

        setSaveStatus("RESTORED OK");
        logActivity("GitHub Pull Restore", "SUCCESS", `Successfully pulled and overwritten local database state from ${ghRepo}`);
        alert("SUCCESS: Fully restored local workspace IndexedDB structure from GitHub repository backup snapshot!");
      } else {
        throw new Error("Could not find cms-backup.json in your repository at path: /portfolio-data/cms-backup.json");
      }
    } catch (err: any) {
      alert("GitHub Synchronizer collapsed: " + err.message);
      logActivity("GitHub Sync Fail", "CRITICAL", err.message);
    } finally {
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const styles = {
    green: { text: "text-emerald-400RGB", rawText: "text-emerald-400", bg: "bg-emerald-500", border: "border-emerald-500/25", outline: "focus:border-emerald-400", chip: "bg-emerald-500/10 text-emerald-300 pointer-events-none" },
    cyan: { text: "text-cyan-400RGB", rawText: "text-cyan-400", bg: "bg-cyan-500", border: "border-cyan-500/25", outline: "focus:border-cyan-400", chip: "bg-cyan-500/10 text-cyan-300 pointer-events-none" },
    purple: { text: "text-purple-400RGB", rawText: "text-purple-400", bg: "bg-purple-500", border: "border-purple-500/25", outline: "focus:border-purple-400", chip: "bg-purple-500/10 text-purple-300 pointer-events-none" },
    amber: { text: "text-amber-400RGB", rawText: "text-amber-400", bg: "bg-amber-500", border: "border-amber-500/25", outline: "focus:border-amber-400", chip: "bg-amber-500/10 text-amber-300 pointer-events-none" }
  }[accentColor];

  // ----------------------------------------------------
  // SECURE AUTHENTICATION SCREEN VIEW
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="relative flex flex-col justify-center items-center min-h-[85vh] px-4">
        <div className={`p-6 md:p-8 border rounded-md max-w-md w-full bg-[#0a0a0f] backdrop-blur-md relative font-mono ${styles.border}`} id="admin-gate-card">
          <div className="text-center space-y-4 mb-6">
            <div className="h-10 w-10 mx-auto rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-400 animate-pulse">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-widest text-[#f3f4f6] uppercase">IPS AUTHENTICATOR HANDSHAKE</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase">Enter cyber deck credentials configuration</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1.5 uppercase">Deck Security Code:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PROT_PASSWORD_NODE"
                disabled={isLoading || lockoutTimeLeft > 0}
                className="w-full bg-[#030305] border border-stone-800 text-slate-100 placeholder-stone-600 rounded-sm py-2 px-3 text-xs font-mono outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500/30 font-bold tracking-widest"
                id="admin-passcode-field"
              />
            </div>

            {authError && (
              <div className="p-2 border border-red-500/20 text-[9px] text-red-400 bg-red-500/5 leading-relaxed uppercase whitespace-pre-wrap">
                [ALERT]: {authError}
              </div>
            )}

            {lockoutTimeLeft > 0 && (
              <div className="text-center text-[10px] text-red-400 uppercase font-bold animate-pulse">
                IP SHUN ACTIVE. RE-ALIGN CHANNELS IN: {lockoutTimeLeft} SECONDS
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onBackToApp}
                className="cursor-pointer flex-1 py-2 border border-slate-700 text-slate-300 text-xs rounded-sm hover:border-white transition-all uppercase"
              >
                DISCONNECT
              </button>
              <button
                type="submit"
                disabled={isLoading || !password.trim() || lockoutTimeLeft > 0}
                className="cursor-pointer flex-1 py-1 px-3 bg-red-600 hover:bg-red-500 text-black font-extrabold text-xs rounded-sm uppercase tracking-wider transition-all disabled:opacity-40"
                id="admin-handshake-trigger"
              >
                {isLoading ? "ALIGNING..." : "COMMIT KEY"}
              </button>
            </div>
          </form>

          <div className="text-[8px] text-slate-600 text-center mt-6 uppercase leading-relaxed">
            Note: IPS is active. Unauthorized queries logged dynamically under target telemetry database nodes.
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED SYSTEM DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono" id="admin-main-interface">
      {/* 1. Left System panel navigation */}
      <div className="lg:col-span-3 space-y-4">
        <div className={`p-4 border rounded-sm bg-[#08080c] relative ${styles.border}`} id="admin-control-hub">
          <div className="flex justify-between items-center pb-3 border-b border-stone-800 mb-4 select-none">
            <div>
              <span className="text-xs font-bold text-white tracking-widest uppercase">IIR ADMIN PANEL</span>
              <p className="text-[8px] text-emerald-400 animate-pulse mt-0.5 font-bold">STATE: SECURE DECK ACTIVE</p>
            </div>
            <Database className={`h-4 w-4 ${styles.text}`} />
          </div>

           <div className="space-y-1.5 flex flex-col">
            {[
              { id: "hero", label: "HERO BIOGRAPHY CMS", count: null },
              { id: "projects", label: "PROJECTS REGISTRY", count: projects.length },
              { id: "skills", label: "SKILLS MATRIX", count: skills.length },
              { id: "messages", label: "INCOMING PACKETS", count: messages.length },
              { id: "backups", label: "BACKUPS & RESTORE", count: snapshots.length },
              { id: "cv", label: "SECURE CV ATTACH", count: cvVersions.length },
              { id: "telemetry", label: "INCIDENT & FIREWALL", count: intrusionAttempts.length },
              { id: "devops", label: "DEVOPS & DEPLOYMENTS", count: "ACTIVE" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setEditingProject(null);
                  setEditingSkill(null);
                }}
                className={`w-full text-left px-3 py-2 text-[10px] rounded-[1.5px] border cursor-pointer select-none transition-all flex justify-between items-center ${
                  activeTab === tab.id
                    ? `bg-white text-black font-extrabold border-white`
                    : `text-stone-400 bg-transparent border-transparent hover:text-white hover:bg-stone-900/30`
                }`}
                id={`admin-tab-${tab.id}`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[8px] px-1 rounded-sm border select-none ${
                    activeTab === tab.id ? "bg-black text-white border-black" : "bg-stone-950 border-stone-800 text-stone-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={onBackToApp}
            className="cursor-pointer w-full mt-6 py-2 border border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] font-extrabold rounded-sm uppercase tracking-wider text-center"
            id="admin-logout-trigger"
          >
            DISCONNECT TELEMETRY
          </button>
        </div>

        {/* Real-time Operation log events */}
        <div className="p-3 border border-stone-800 rounded-sm bg-black/60 h-44 overflow-y-auto scrollbar-none flex flex-col space-y-1.5 font-mono select-none">
          <span className="text-[9px] text-[#a1a1aa] font-bold pb-1 border-b border-stone-900 uppercase">SYS TELEMETRY HANDLERS:</span>
          {activityLogs.map((log) => (
            <div key={log.id} className="text-[8px] leading-relaxed break-words">
              <span className="text-slate-500">[{log.timestamp}]</span>{" "}
              <span className={`font-bold ${
                log.status === "SUCCESS" ? "text-emerald-400" : log.status === "WARN" ? "text-amber-400" : "text-rose-500 animate-pulse"
              }`}>[{log.status}]</span>{" "}
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
          {activityLogs.length === 0 && (
            <div className="text-[8px] text-slate-600 uppercase">No active operations recorded inside neural logs.</div>
          )}
        </div>
      </div>

      {/* 2. Main Edit/Dashboard panel */}
      <div className="lg:col-span-9 space-y-4">
        {/* Save/Status overhead alert */}
        {saveStatus && (
          <div className="p-2.5 border border-amber-500/25 text-[10px] text-amber-300 bg-amber-500/5 rounded-sm font-bold animate-pulse flex items-center justify-between uppercase">
            <span>[DB MONITOR]: {saveStatus}</span>
            <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 1: HERO BIOGRAPHY MATRIX                        */}
        {/* ==================================================== */}
        {activeTab === "hero" && (
          <div className="p-5 border border-stone-800 rounded-sm bg-[#08080c] space-y-4">
            <div className="pb-3 border-b border-stone-800 flex justify-between items-center select-none">
              <h3 className="text-xs font-extrabold text-[#f3f4f6] uppercase">CENTRAL CONFIGURATION CMS:</h3>
              <Globe className={`h-4 w-4 ${styles.text}`} />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase">Hero Name Label:</label>
                  <input
                    value={heroConfig.heroName}
                    onChange={(e) => setHeroConfig({ ...heroConfig, heroName: e.target.value })}
                    className={`w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-2 px-3 text-xs outline-hidden ${styles.outline}`}
                    id="cms-hero-name"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase">Hero Title Subtitle:</label>
                  <input
                    value={heroConfig.heroTitle}
                    onChange={(e) => setHeroConfig({ ...heroConfig, heroTitle: e.target.value })}
                    className={`w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-2 px-3 text-xs outline-hidden ${styles.outline}`}
                    id="cms-hero-title"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase">Typing tags slider loop (comma-separated):</label>
                <input
                  value={heroConfig.typingTags}
                  onChange={(e) => setHeroConfig({ ...heroConfig, typingTags: e.target.value })}
                  placeholder="e.g. SYSTEMS DEVELOPER, LINUX RICER..."
                  className={`w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-2 px-3 text-xs outline-hidden ${styles.outline}`}
                  id="cms-hero-typing-tags"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 uppercase">Intro Biography Description:</label>
                <textarea
                  value={heroConfig.heroBio}
                  onChange={(e) => setHeroConfig({ ...heroConfig, heroBio: e.target.value })}
                  rows={4}
                  className={`w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-2 px-3 text-xs outline-hidden font-mono leading-relaxed ${styles.outline}`}
                  id="cms-hero-bio"
                />
              </div>

              <div className="pt-2 border-t border-stone-900 flex justify-end">
                <button
                  onClick={handleSaveHero}
                  className="cursor-pointer px-4 py-2.5 bg-white text-black text-[10px] font-extrabold rounded-sm uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-1.5"
                  id="cms-hero-save-btn"
                >
                  <Save className="h-3 w-3" />
                  <span>SYNCHRONIZE PROFILE CHANGES</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: PROJECTS REGISTRY CMS                        */}
        {/* ==================================================== */}
        {activeTab === "projects" && (
          <div className="p-5 border border-stone-800 rounded-sm bg-[#08080c] space-y-4">
            <div className="pb-3 border-b border-stone-800 flex justify-between items-center select-none">
              <h3 className="text-xs font-extrabold text-[#f3f4f6] uppercase">ACTIVE REPOSITORIES REGISTRY CONTROLLER</h3>
              <button
                onClick={() => setEditingProject({
                  title: "",
                  description: "",
                  github: "https://github.com/iir20",
                  demoVisualType: "music",
                  features: ["AI Integration", "Fast Cache"],
                  tags: ["Kotlin", "React"],
                  repositoryStats: { commits: 12, stars: 3, forks: 1, testCoverage: "92%" }
                })}
                className="cursor-pointer px-2.5 py-1 border border-[#27272a] hover:border-white text-white text-[10px] rounded-sm uppercase flex items-center gap-1 bg-black/40"
                id="cms-project-add-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>NEW REPOSITORY</span>
              </button>
            </div>

            {editingProject ? (
              <form onSubmit={handleSaveProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase">Repository Title:</label>
                    <input
                      required
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      className="w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-2 px-3 text-xs outline-hidden"
                      id="cms-proj-title"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase">GitHub Url:</label>
                    <input
                      required
                      value={editingProject.github}
                      onChange={(e) => setEditingProject({ ...editingProject, github: e.target.value })}
                      className="w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-2 px-3 text-xs outline-hidden"
                      id="cms-proj-github"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase">Short Code Description:</label>
                  <textarea
                    required
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    rows={2}
                    className="w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-2 px-3 text-xs outline-hidden"
                    id="cms-proj-desc"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-1 uppercase">Commits Log Count:</label>
                    <input
                      type="number"
                      value={editingProject.repositoryStats?.commits || 10}
                      onChange={(e) => setEditingProject({
                        ...editingProject,
                        repositoryStats: { ...editingProject.repositoryStats, commits: Number(e.target.value) }
                      })}
                      className="w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-1.5 px-3 text-xs outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-1 uppercase">Stars Weight Count:</label>
                    <input
                      type="number"
                      value={editingProject.repositoryStats?.stars || 0}
                      onChange={(e) => setEditingProject({
                        ...editingProject,
                        repositoryStats: { ...editingProject.repositoryStats, stars: Number(e.target.value) }
                      })}
                      className="w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-1.5 px-3 text-xs outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-1 uppercase">Test Coverage Rating (%)</label>
                    <input
                      value={editingProject.repositoryStats?.testCoverage || "90%"}
                      onChange={(e) => setEditingProject({
                        ...editingProject,
                        repositoryStats: { ...editingProject.repositoryStats, testCoverage: e.target.value }
                      })}
                      className="w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-1.5 px-3 text-xs outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-1 uppercase">Interactive Demo Category</label>
                    <select
                      value={editingProject.demoVisualType}
                      onChange={(e) => setEditingProject({ ...editingProject, demoVisualType: e.target.value })}
                      className="w-full bg-[#030305] border border-[#27272a] text-slate-300 rounded-sm py-1.5 px-3 text-xs outline-hidden font-mono"
                    >
                      <option value="music">Retro Music-Arp</option>
                      <option value="intel">Cyber Intelligence Tracer</option>
                      <option value="rent">Flat Listing Geolocation Map</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-stone-900 select-none">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="cursor-pointer px-3.5 py-1.5 border border-[#27272a] text-slate-300 text-[10px] rounded-[1.5px]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer px-4 py-1.5 bg-white text-black font-extrabold text-[10px] rounded-[1.5px] uppercase"
                    id="cms-proj-submit"
                  >
                    WRITE TO FIRESTORE doc
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.firestoreId} className="p-3 border border-[#1c1c24] rounded-sm bg-[#040406]/60 flex items-center justify-between font-mono gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase">{proj.title}</span>
                        <span className="text-[8px] font-mono border border-stone-800 text-stone-500 px-1.5 py-0.5 rounded-[1.5px] uppercase select-none leading-none">
                          commits: {proj.repositoryStats?.commits}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-1 leading-relaxed truncate max-w-lg">{proj.description}</p>
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      <button
                        onClick={() => setEditingProject(proj)}
                        className="cursor-pointer p-1.5 border border-[#27272a] rounded-sm hover:border-[#a1a1aa] text-[#a1a1aa] hover:text-white"
                        title="Edit params"
                        id={`edit-proj-btn-${proj.firestoreId}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.firestoreId, proj.title)}
                        className="cursor-pointer p-1.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-sm"
                        title="Decommission node"
                        id={`delete-proj-btn-${proj.firestoreId}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-6 text-[10px] text-slate-500 uppercase font-mono">No custom projects committed inside active database profiles. Seeding defaults...</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: SKILLS MATRIX CMS                            */}
        {/* ==================================================== */}
        {activeTab === "skills" && (
          <div className="p-5 border border-stone-800 rounded-sm bg-[#08080c] space-y-4">
            <div className="pb-3 border-b border-stone-800 flex justify-between items-center select-none">
              <h3 className="text-xs font-extrabold text-[#f3f4f6] uppercase">CENTRAL SKILLMATRIX GRID CONFIGURATION</h3>
              <button
                onClick={() => setEditingSkill({
                  name: "",
                  level: 85,
                  category: "Cyber Security",
                  status: "SECURED",
                  metrics: "Firewall diagnostics, sandbox evaluation"
                })}
                className="cursor-pointer px-2.5 py-1 border border-[#27272a] hover:border-white text-white text-[10px] rounded-sm uppercase flex items-center gap-1 bg-black/40"
                id="cms-skill-add-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>NEW SKILLWEIGHT</span>
              </button>
            </div>

            {editingSkill ? (
              <form onSubmit={handleSaveSkill} className="space-y-4 font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase">Skill Target Label:</label>
                    <input
                      required
                      value={editingSkill.name}
                      onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                      className="w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-2 px-3 text-xs outline-hidden"
                      id="cms-skill-name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase">Category Matrix Section:</label>
                    <select
                      value={editingSkill.category}
                      onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                      className="w-full bg-[#030305] border border-[#27272a] text-slate-300 rounded-sm py-1.5 px-3 text-xs outline-hidden font-mono"
                    >
                      <option value="Cyber Security">Cyber Security Engineering</option>
                      <option value="Systems & OS">Systems & OS Custom architecture</option>
                      <option value="Languages">Languages & Algorithms core</option>
                      <option value="Design & UX">Design & UX foundations</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase">Cognitive weight level (%) {editingSkill.level}%</label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={editingSkill.level}
                      onChange={(e) => setEditingSkill({ ...editingSkill, level: Number(e.target.value) })}
                      className="w-full h-1.5 bg-[#18181b] rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 uppercase">State Signal status:</label>
                    <select
                      value={editingSkill.status}
                      onChange={(e) => setEditingSkill({ ...editingSkill, status: e.target.value })}
                      className="w-full bg-[#030305] border border-[#27272a] text-slate-300 rounded-sm py-1.5 px-3 text-xs outline-hidden font-mono"
                    >
                      <option value="SECURED">SECURED SHIELD</option>
                      <option value="ACTIVE">ACTIVE RUNNING</option>
                      <option value="INTEGRATED">PORT_INTEGRATED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 uppercase">Short Operational Description Metric:</label>
                  <input
                    value={editingSkill.metrics}
                    onChange={(e) => setEditingSkill({ ...editingSkill, metrics: e.target.value })}
                    className="w-full bg-[#030305] border border-[#27272a] text-slate-100 rounded-sm py-2 px-3 text-xs outline-hidden"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-stone-900 select-none">
                  <button
                    type="button"
                    onClick={() => setEditingSkill(null)}
                    className="cursor-pointer px-3.5 py-1.5 border border-[#27272a] text-slate-300 text-[10px] rounded-[1.5px]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer px-4 py-1.5 bg-white text-black font-extrabold text-[10px] rounded-[1.5px] uppercase animate-pulse"
                    id="cms-skill-submit"
                  >
                    COMMIT TO SKILL GRID
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.firestoreId} className="p-2.5 border border-[#1c1c24] rounded-sm bg-[#040406]/60 flex items-center justify-between gap-4 font-mono">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase">{skill.name}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm select-none ${styles.chip}`}>
                          {skill.category} ({skill.level}%)
                        </span>
                      </div>
                      <p className="text-[9px] text-[#e4e4e7] mt-0.5 truncate leading-tight">{skill.metrics}</p>
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      <button
                        onClick={() => setEditingSkill(skill)}
                        className="cursor-pointer p-1.5 border border-[#27272a] rounded-sm text-[#a1a1aa] hover:text-white"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.firestoreId, skill.name)}
                        className="cursor-pointer p-1.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: INCOMING TRANSMITTERS MESSAGES               */}
        {/* ==================================================== */}
        {activeTab === "messages" && (
          <div className="p-5 border border-stone-800 rounded-sm bg-[#08080c] space-y-4">
            <h3 className="text-xs font-extrabold text-[#f3f4f6]" id="msgs-header uppercase">CRYPTOGRAPHIC CONNECTION SIGNALS PACKETS LOG</h3>
            
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.firestoreId} className="p-4 border border-[#e4e4e7]/5 rounded-sm bg-[#06060a] relative flex flex-col font-mono" id={`message-card-${m.firestoreId}`}>
                  <button
                    onClick={() => handleDeleteMessage(m.firestoreId)}
                    className="cursor-pointer absolute top-3.5 right-3.5 p-1 text-red-500 hover:bg-red-500/10 border border-red-500/15 rounded-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-2 mb-2 select-none">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <User className={`h-3 w-3 ${styles.text}`} />
                      CODENAME: {m.sender}
                    </span>
                    <span className="text-[8px] font-mono bg-[#27272a]/40 border border-stone-800 text-stone-400 px-2 py-0.5 rounded-sm">
                      {m.frequency}
                    </span>
                  </div>

                  <p className="text-[9px] text-[#a1a1aa] mb-1">EMAIL NODE: {m.email}</p>
                  <p className="text-[10px] text-slate-200 mt-2 bg-black/45 p-3 border border-[#27272a] rounded-[1.5px] font-sans italic leading-relaxed font-bold">
                    &quot;{m.message}&quot;
                  </p>

                  <div className="text-[8px] text-stone-500 mt-2 flex justify-between uppercase">
                    <span>Crypto Signature: {m.packetSignature || "CRYPTO_FALLBACK"}</span>
                    <span>Transmitted: {m.timestamp}</span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-10 text-[10px] text-slate-500 uppercase">No active secure packet coordinates recorded on communications channels.</div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: BACKUPS AND ROBUSTNESS SNAP RESTORER         */}
        {/* ==================================================== */}
        {activeTab === "backups" && (
          <div className="p-5 border border-stone-800 rounded-sm bg-[#08080c] space-y-4">
            <div className="pb-3 border-b border-stone-800 flex justify-between items-center select-none">
              <h3 className="text-xs font-extrabold text-[#f3f4f6]" id="snaps-header uppercase">ROBUST BACKUP IMAGES & MICRO-ROLLBACK MANAGERS</h3>
              <button
                onClick={handleCreateSnapshot}
                className="cursor-pointer px-3.5 py-1.5 border border-dashed border-sky-500/50 hover:bg-sky-500/10 text-sky-400 text-[10px] rounded-sm uppercase font-bold flex items-center gap-1.5"
                id="do-backup-btn"
              >
                <Save className="h-3.5 w-3.5" />
                <span>SAVE CONFIG SNAPSHOT</span>
              </button>
            </div>

            <p className="text-[10px] text-[#a1a1aa] leading-relaxed uppercase pb-2 border-b border-stone-900 select-none">
              Adheres strictly to the Built-in Data Robustness spec. Commit state matrices and trigger instantaneous complete database rollback restorations at any coordinate.
            </p>

            <div className="space-y-4 font-mono">
              {snapshots.map((snap) => (
                <div key={snap.id} className="p-4 border border-stone-800 hover:border-sky-500/20 bg-stone-950/40 rounded-sm relative flex flex-col md:flex-row justify-between items-baseline gap-4" id={`snap-card-${snap.id}`}>
                  <div>
                    <span className="text-xs font-bold text-white uppercase">{snap.name}</span>
                    <p className="text-[8px] text-[#71717a] mt-0.5 select-none uppercase">RECORDED ON COORDINATES: {snap.timestamp} | Projects block weight: {snap.projects?.length || 0}</p>
                    
                    {/* Collapsed schematic preview */}
                    <p className="text-[8px] text-slate-400 italic mt-2 overflow-hidden truncate max-w-lg select-all">
                      hero bios preview: &quot;{snap.heroConfig?.heroBio?.substring(0, 95)}...&quot;
                    </p>
                  </div>

                  <div className="flex gap-2 select-none self-end">
                    <button
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="cursor-pointer px-3 py-1 bg-sky-600 hover:bg-sky-500 text-black font-extrabold text-[9px] rounded-sm transition-all flex items-center gap-1 uppercase tracking-wider"
                      id={`restore-btn-${snap.id}`}
                    >
                      <Undo className="h-2.5 w-2.5" />
                      <span>ROLLBACK STATE</span>
                    </button>
                  </div>
                </div>
              ))}
              {snapshots.length === 0 && (
                <div className="text-center py-6 text-[10px] text-stone-600 font-bold uppercase animate-pulse select-none">No rollback images committed inside active nodes backups matrix.</div>
              )}
            </div>

            {/* GITHUB DATA BACKUP SYNC SECTION */}
            <div className="pt-5 border-t border-stone-900 mt-6 space-y-4">
              <div className="flex items-center gap-2 select-none">
                <Github className="h-4 w-4 text-emerald-400" />
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">GITHUB DATA HARBOR / DEPLOYMENT SNAPSHOT SYNCER</h4>
              </div>
              <p className="text-[9px] text-[#8e8e93] uppercase leading-relaxed max-w-2xl select-none font-mono">
                Adheres to Serverless Zero-Backend layout specs. Push, download, and synchronize your entire local IndexedDB state directly key-for-key with dynamic JSON storage files on your repository branch via GitHub API.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-500 uppercase tracking-wider block font-mono">GITHUB PERSONAL ACCESS TOKEN (PAT)</label>
                  <input
                    type="password"
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full text-[9px] bg-[#040406] border border-stone-800 rounded-sm p-2 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-500 uppercase tracking-wider block font-mono">TARGET SOURCE REPOSITORY</label>
                  <input
                    type="text"
                    value={ghRepo}
                    onChange={(e) => setGhRepo(e.target.value)}
                    placeholder="iir20/ratul-cyber-deck"
                    className="w-full text-[9px] bg-[#040406] border border-stone-800 rounded-sm p-2 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-500 uppercase tracking-wider block font-mono">BRANCH COORDINATES</label>
                  <input
                    type="text"
                    value={ghBranch}
                    onChange={(e) => setGhBranch(e.target.value)}
                    placeholder="main"
                    className="w-full text-[9px] bg-[#040406] border border-stone-800 rounded-sm p-2 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 select-none">
                <button
                  type="button"
                  onClick={handlePushToGitHub}
                  className="cursor-pointer px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[9px] rounded-sm uppercase flex items-center gap-1.5 font-mono"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>COMMIT DYNAMIC DATA TO REPOSITORY SOURCE</span>
                </button>

                <button
                  type="button"
                  onClick={handlePullFromGitHub}
                  className="cursor-pointer px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-[9px] rounded-sm uppercase flex items-center gap-1.5 font-mono"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>PULL LATEST METADATA SNAP FROM GITHUB</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: SECURITY DISPATCH & FIREWALL TELEMETRY        */}
        {/* ==================================================== */}
        {activeTab === "telemetry" && (
          <div className="p-5 border border-stone-800 rounded-sm bg-[#08080c] space-y-6">
            <div className="border-b border-stone-900 pb-3 flex justify-between items-center select-none">
              <h3 className="text-xs font-extrabold text-[#f3f4f6] uppercase flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                TACTICAL SECURITY CYBER CONSOLE & IPS NETWORK
              </h3>
              <div className="flex gap-2">
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded-[1.5px] border uppercase font-bold animate-pulse ${
                  maintenanceMode ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}>
                  {maintenanceMode ? "EMERGENCY SHUTDOWN ACTIVE" : "SYSTEM NOMINAL - IPS ACTIVE"}
                </span>
              </div>
            </div>

            {/* Tactical Grid Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 select-none">
              <div className="p-3 border border-stone-800 bg-[#040407] rounded-sm text-center">
                <span className="text-[9px] text-[#71717a] block tracking-wider uppercase">FIREWALL SHIELD STATUS</span>
                <span className={`text-sm font-bold tracking-widest mt-1 block uppercase ${
                  firewallStatus === "ACTIVE" ? "text-emerald-400" : "text-yellow-400"
                }`}>{firewallStatus}</span>
                <button 
                  onClick={() => {
                    const next = firewallStatus === "ACTIVE" ? "RE-ROUTING" : "ACTIVE";
                    setFirewallStatus(next);
                    logActivity("Firewall Handshake", "WARN", `Toggled shield context parameters to: ${next}`);
                  }}
                  className="cursor-pointer text-[8px] border border-zinc-850 px-2 py-0.5 mt-2 hover:bg-zinc-900 uppercase font-mono text-zinc-400"
                >
                  CYCLE SHIELD
                </button>
              </div>

              <div className="p-3 border border-stone-800 bg-[#040407] rounded-sm text-center">
                <span className="text-[9px] text-[#71717a] block tracking-wider uppercase">CSP HEADERS POLICIES</span>
                <span className="text-sm font-bold text-cyan-400 tracking-widest mt-1 block uppercase">{cspStatus}</span>
                <button 
                  onClick={() => {
                    const next = cspStatus === "ENFORCED" ? "AUDITING_ONLY" : "ENFORCED";
                    setCspStatus(next);
                    logActivity("CSP Alignment", "SUCCESS", `Policy sets aligned to: ${next}`);
                  }}
                  className="cursor-pointer text-[8px] border border-zinc-850 px-2 py-0.5 mt-2 hover:bg-zinc-900 uppercase font-mono text-zinc-400"
                >
                  ADJUST POLICY
                </button>
              </div>

              <div className="p-3 border border-stone-800 bg-[#040407] rounded-sm text-center">
                <span className="text-[9px] text-[#71717a] block tracking-wider uppercase">EMERGENCY TOGGLE</span>
                <span className={`text-sm font-bold tracking-widest mt-1 block uppercase ${
                  maintenanceMode ? "text-rose-500 animate-pulse font-extrabold" : "text-zinc-500"
                }`}>{maintenanceMode ? "SHUTDOWN" : "SAFE_MODE"}</span>
                <button 
                  onClick={() => {
                    const next = !maintenanceMode;
                    setMaintenanceMode(next);
                    logActivity("Core Interlock Reset", next ? "CRITICAL" : "SUCCESS", next ? "EMERGENCY MAINTENANCE SYSTEM INTERLOCK ACTIVATED" : "Standard operations re-aligned");
                  }}
                  className="cursor-pointer text-[8px] border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-00 px-2 py-0.5 mt-2 uppercase font-mono"
                >
                  INTERLOCK
                </button>
              </div>

              <div className="p-3 border border-stone-800 bg-[#040407] rounded-sm text-center">
                <span className="text-[9px] text-[#71717a] block tracking-wider uppercase">ACTIVE NETWORK SWEEPS</span>
                <span className="text-sm font-bold text-emerald-400 tracking-widest mt-1 block">99.9% SECURE</span>
                <span className="text-[7px] text-zinc-600 block mt-2 uppercase font-mono">APP CHECK: ACTIVE</span>
              </div>
            </div>

            {/* Bangladesh Geographic Telemetry */}
            <div className="p-4 border border-stone-850 rounded-sm bg-black/50 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 select-none">
                <span className="text-[9px] font-bold tracking-widest text-[#a1a1aa] uppercase">BANGLADESH ROUTER COORDINATES SWITCH (ACTIVE RADAR SCAN)</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-[1.5px] bg-[#18181b] text-slate-300 border border-stone-800 select-all uppercase">
                  ACTIVE DECK GRID: {activeMapDivision}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* SVG vector custom interactive canvas */}
                <div className="col-span-1 md:col-span-6 flex justify-center">
                  <div className="relative w-60 h-60 border border-[#e4e4e7]/5 bg-[#030305] rounded-full flex items-center justify-center p-4">
                    <svg className="w-full h-full text-slate-700/40 select-none cursor-default" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="0.25" strokeDasharray="3,3" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="#27272a" strokeWidth="0.25" />
                      <circle cx="50" cy="50" r="15" fill="none" stroke="#27272a" strokeWidth="0.25" strokeDasharray="1,2" />
                      <line x1="50" y1="5" x2="50" y2="95" stroke="#27272a" strokeWidth="0.25" />
                      <line x1="5" y1="50" x2="95" y2="50" stroke="#27272a" strokeWidth="0.25" />

                      <path d="M 50 15 L 60 25 L 58 40 L 68 55 L 60 70 L 48 85 L 42 75 L 35 60 L 30 45 L 38 30 Z" 
                            fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4,2" className="text-stone-700" />

                      {[
                        { name: "Dhaka (Savar)", cx: 50, cy: 45, size: 4, col: "text-emerald-400" },
                        { name: "Khulna (Md Lalmia legacy landmark)", cx: 42, cy: 68, size: 5, col: "text-rose-400" },
                        { name: "Chittagong Network", cx: 64, cy: 75, size: 3, col: "text-cyan-400" },
                        { name: "Sylhet Gate-90", cx: 62, cy: 30, size: 3, col: "text-purple-400" },
                        { name: "Rajshahi Router", cx: 33, cy: 36, size: 3, col: "text-amber-400" }
                      ].map((div) => (
                        <circle
                          key={div.name}
                          cx={div.cx}
                          cy={div.cy}
                          r={activeMapDivision === div.name ? div.size + 1.5 : div.size}
                          fill="currentColor"
                          className={`cursor-pointer transition-all ${div.col} ${
                            activeMapDivision === div.name ? "animate-[pulse_1s_infinite] stroke-white stroke-[1px] shadow-lg scale-125" : "hover:scale-110 hover:stroke-white/30 hover:stroke-[1px]"
                          }`}
                          onClick={() => {
                            setActiveMapDivision(div.name);
                            setVisitorCount((prev) => prev + Math.floor(Math.random() * 10) + 1);
                            logActivity("Telemetry Sweep", "SUCCESS", `Assessed active geographical router packets channel in: "${div.name}"`);
                          }}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 bg-linear-to-b from-[#10b981]/5 to-transparent h-1/2 w-full pointer-events-none animate-[bounce_8s_infinite] select-none" />
                  </div>
                </div>

                {/* Intrusion Log Stream Panel inside Telemetry tab */}
                <div className="col-span-1 md:col-span-6 space-y-3 font-mono">
                  <div className="flex justify-between items-center pb-1 border-b border-zinc-900 select-none">
                    <span className="text-[9px] font-bold text-red-400 uppercase flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 inline" /> LIVE INTRUSION ATTACK STREAM
                    </span>
                    <button 
                      onClick={() => {
                        const payloads = [
                          { payload: "XSS <script>alert(1)</script>", route: "/api/chat", ip: "45.138.16.82", risk: "HIGH" },
                          { payload: "Directory Traversal ../../../etc/passwd", route: "/static", ip: "185.34.22.15", risk: "CRITICAL" },
                          { payload: "Brute Force SSH Auth attempt", route: "/ssh", ip: "82.102.23.4", risk: "MEDIUM" }
                        ];
                        const randomPayload = payloads[Math.floor(Math.random() * payloads.length)];
                        setIntrusionAttempts(prev => [
                          {
                            id: `int-${Date.now()}`,
                            timestamp: new Date().toLocaleTimeString(),
                            ip: randomPayload.ip,
                            route: randomPayload.route,
                            payload: randomPayload.payload,
                            status: "SHUNNED_DROP",
                            risk: randomPayload.risk
                          },
                          ...prev
                        ]);
                        setMalwareBlocks(prev => prev + 1);
                        logActivity("IPS Firewall Threat Blocked", "CRITICAL", `Threat trigger: "${randomPayload.payload}" from IP ${randomPayload.ip}`);
                      }}
                      className="cursor-pointer text-[8px] bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 px-2 py-0.5 uppercase"
                    >
                      TRIGGER THREAT STIM
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-none">
                    {intrusionAttempts.map((int) => (
                      <div key={int.id} className="p-2 border border-zinc-900 bg-black/40 rounded-sm text-[8px] text-zinc-400 relative">
                        <div className="flex justify-between font-bold items-center mb-1">
                          <span className="text-zinc-200 uppercase">[ATTACK] SOURCE: {int.ip}</span>
                          <span className={`px-1 rounded-sm ${
                            int.risk === "CRITICAL" ? "bg-red-950 text-red-400 font-extrabold animate-pulse" : int.risk === "HIGH" ? "bg-amber-950 text-amber-400" : "bg-zinc-800 text-zinc-400"
                          }`}>{int.risk} RISK</span>
                        </div>
                        <p className="font-mono text-zinc-300 leading-tight">Payload: {int.payload}</p>
                        <p className="font-mono text-[7px] text-zinc-500 mt-0.5 uppercase">ROUTE: {int.route} | STATUS: {int.status} | TIME: {int.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: SECURE CV ATTACHMENT MANAGER                  */}
        {/* ==================================================== */}
        {activeTab === "cv" && (
          <div className="p-5 border border-stone-800 rounded-sm bg-[#08080c] space-y-6">
            <div className="pb-3 border-b border-stone-800 flex justify-between items-center select-none">
              <h3 className="text-xs font-bold text-[#f3f4f6] uppercase flex items-center gap-1.5">
                <UploadCloud className="h-4 w-4 text-emerald-400" />
                SECURE CV CONFIGURATION & UPLOAD TERMINAL
              </h3>
              <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/30 rounded-sm select-none uppercase font-bold animate-pulse">
                STATUS: SYNCED
              </span>
            </div>

            <p className="text-[10px] text-[#a1a1aa] leading-relaxed uppercase pb-2 border-b border-stone-900 select-none">
              Inject, replace, or wipe production-level curriculum vitae assets. Only secure PDF envelopes under 5.0 MB are accepted via safe file-integrity gateways.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drag & Drop Visual Box */}
              <div className="space-y-4">
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleCVUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/40 bg-zinc-950/20 hover:bg-emerald-500/5 duration-300 rounded-sm p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px]"
                >
                  <input 
                    type="file" 
                    id="cv-file-input" 
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCVUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="cv-file-input" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="h-10 w-10 text-zinc-500 mb-2.5 animate-bounce" />
                    <span className="text-[11px] text-zinc-300 font-bold uppercase tracking-wider">Drag & Drop CV PDF Here</span>
                    <span className="text-[8px] text-zinc-500 mt-1 uppercase">or click to browse filesystem</span>
                    <span className="text-[8px] text-zinc-600 mt-3 border border-zinc-800 px-2 py-0.5 uppercase bg-black/40">max payload: 5.0MB</span>
                  </label>
                </div>

                {isUploading && (
                  <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-sm space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold text-emerald-400 select-none">
                      <span>SECURE CORRIDOR STREAMING: {selectedFileName}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    {/* Glowing progress line */}
                    <div className="w-full h-1.5 bg-[#0e0e13] rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-emerald-400 rounded-full duration-150 shadow-[0_0_8px_#10b981]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="text-[8px] text-emerald-500/70 uppercase flex items-center gap-1">
                      <Terminal className="h-3 w-3 inline animate-pulse" />
                      <span>transmitting binary packets to secure firestore document...</span>
                    </div>
                  </div>
                )}

                {cvError && (
                  <div className="p-3 border border-red-500/20 bg-red-400/5 text-red-400 text-[10px] uppercase font-mono space-y-1.5 rounded-sm">
                    <div className="flex items-center gap-1 font-bold">
                      <AlertTriangle className="h-4 w-4" />
                      <span>GATEWAY EXCEPTION DETECTED:</span>
                    </div>
                    <p className="text-[9px] text-red-300 leading-relaxed">{cvError}</p>
                  </div>
                )}
              </div>

              {/* Active CV details and quick settings */}
              <div className="space-y-4">
                <div className="p-4 border border-[#27272a] bg-stone-950/40 rounded-sm space-y-3.5">
                  <span className="text-[9px] text-[#71717a] block tracking-widest uppercase">CURRENT PRODUCTION ENVELOPE</span>
                  
                  {activeCV ? (
                    <div className="space-y-3 font-mono">
                      <div className="flex items-start gap-3">
                        <div className="p-2 border border-zinc-850 bg-black/40 text-emerald-400 rounded-sm">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="space-y-0.5 border-none">
                          <h4 className="text-xs font-bold text-white select-all break-all">{activeCV.fileName}</h4>
                          <p className="text-[8px] text-zinc-500 uppercase select-none">
                            Size: {(activeCV.fileSize / 1024).toFixed(1)} KB | VERSION: v{activeCV.version}
                          </p>
                          <p className="text-[8px] text-zinc-500 uppercase select-none font-bold">
                            UPDATED: {new Date(activeCV.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Download and preview anchors */}
                      <div className="flex gap-2.5 pt-2.5 border-t border-zinc-900 select-none">
                        <a
                          href={activeCV.downloadUrl}
                          download={activeCV.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="cursor-pointer px-3.5 py-1.5 text-[10px] items-center gap-1 border border-zinc-700 bg-white/5 text-zinc-300 hover:text-white hover:bg-zinc-800 font-bold uppercase tracking-wider inline-flex rounded-sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview CV</span>
                        </a>
                        <button
                          onClick={handleDeleteCV}
                          className="cursor-pointer px-3.5 py-1.5 text-[10px] items-center gap-1 border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 font-bold uppercase tracking-wider inline-flex rounded-sm ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>DEPREDEATE</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-zinc-600 text-[10px] uppercase font-bold select-none animate-pulse">
                      No custom CV has been uploaded. Cloud is serving default cached template fallback.
                    </div>
                  )}
                </div>

                {/* File integrity / version stats */}
                <div className="p-3 border border-zinc-900 bg-black/35 rounded-sm space-y-2">
                  <span className="text-[9px] font-bold text-[#b4b4b8] block uppercase">ROLLBACK BACKUPS & VERSION LOGS:</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-none">
                    {cvVersions && cvVersions.map((v: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-[8px] text-zinc-400 border-b border-zinc-900 pb-1 font-mono">
                        <span className="text-zinc-200">v{v.version} - {v.fileName?.length > 25 ? v.fileName.substring(0, 22) + "..." : v.fileName}</span>
                        <span className="text-zinc-500">{new Date(v.lastUpdated).toLocaleDateString()} ({(v.fileSize / 1024).toFixed(0)}KB)</span>
                      </div>
                    ))}
                    {(!cvVersions || cvVersions.length === 0) && (
                      <div className="text-[8px] text-zinc-700 uppercase italic">No historical backups committed.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: DEVOPS AUTOMATION LOGS & DEPLOYMENTS         */}
        {/* ==================================================== */}
        {activeTab === "devops" && (
          <DevOpsTab 
            logActivity={logActivity} 
            accentColor={accentColor}
            styles={{ text: styles.text, border: styles.border, bg: styles.bg }}
          />
        )}

      </div>
    </div>
  );
}

// ====================================================
// SUB-COMPONENT: ADVANCED DEVOPS TERMINAL LOGS EMULATOR
// ====================================================
interface DevOpsTabProps {
  logActivity: (type: string, status: "SUCCESS" | "WARN" | "CRITICAL", message: string) => void;
  accentColor: "green" | "cyan" | "purple" | "amber";
  styles: { text: string; border: string; bg: string };
}

function DevOpsTab({ logActivity, accentColor, styles }: DevOpsTabProps) {
  const [activeYml, setActiveYml] = useState<"deploy" | "security" | "lighthouse" | "release">("deploy");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);

  useEffect(() => {
    runMockWorkflow();
  }, [activeYml]);

  const runMockWorkflow = () => {
    setIsCompiling(true);
    let logLines: string[] = [];
    if (activeYml === "deploy") {
      logLines = [
        "🚀 [WORKFLOW TRIGGERED]: push event detected on branch 'main' of iir20/ratul-cyber-deck",
        "📦 Checking out repository source commits... SUCCESS [sha: e28da9c2]",
        "🧪 Aligning Node.js runtime environment dependencies v20... Completed",
        "⚙️ Running lint checks & compilation audits (tsc --noEmit)... PASS",
        "⚙️ Auditing Static Zero-Trust Bundle requirements... NO WARNINGS",
        "⚙️ Compiling production client static bundle (vite compile)...",
        "⚡ Code optimization active. Static resources compressed (gzip ratio 2.4:1)",
        "✔️ Generated dynamic index.html and SEO sitemap.xml routing map",
        "⚡ Pushing bundle files to GitHub Static Pages CDN channels...",
        "🚀 LIVE DEPLOYMENT ON GITHUB: https://iir20.github.io/ completed!",
        "🎉 Global Actions CDN cache purge triggered. NEW RUNTIME ENVIRONMENT ACTIVE!"
      ];
    } else if (activeYml === "security") {
      logLines = [
        "🛡️ [SECURITY SCAN INITIATED]: zero-trust static scanner v2.3",
        "🔍 Parsing package dependencies for known SAST/Snyk disclosures...",
        "✔️ No high-severity vulnerabilities detected in local node tree.",
        "🔍 Scanning credential secrets on overall file paths...",
        "✔️ Zero hardcoded keys or API credentials leaked. Perfect static alignment.",
        "🔍 Checking password authentication hashes constraints...",
        "✔️ Invariants certified: administrative login gated securely via SHA-256 local database.",
        "🎉 Threat database scan completed: 100% secure configuration confirmed."
      ];
    } else if (activeYml === "lighthouse") {
      logLines = [
        "⚡ [LIGHTHOUSE PERFORMANCE AUDIT STARTED]...",
        "🎨 Measuring LCP, Cumulative Layout Shifts, and Input Latency...",
        "📊 Asserting results comparing with Nothing OS digital benchmarks:",
        "   - PERFORMANCE     : 98/100  (LCP: 0.8s, CLS: 0.01)",
        "   - ACCESSIBILITY   : 100/100 (Contrast and Screenreaders nominal)",
        "   - BEST PRACTICES  : 100/100 (Static browser sandbox active)",
        "   - SEO             : 100/100 (Sitemap and metadata synchronized)",
        "🎉 Overall Assertions completed. Excellent rating passed."
      ];
    } else {
      logLines = [
        "📦 [RELEASE MANAGER ACTIVATED]...",
        "📂 Extracting version milestone requirements...",
        "🏷️ Tagging releases with automated token incrementer... v2.6.1-secure",
        "📝 Creating automated git Changelog from history commits...",
        "✔️ Built release artifacts and self-packaged backups files",
        "🚀 Release deployed, publishing to Pages and CDN..."
      ];
    }

    setTerminalLogs([]);
    let counter = 0;
    const interval = setInterval(() => {
      if (counter < logLines.length) {
        setTerminalLogs(prev => [...prev, logLines[counter]]);
        counter++;
      } else {
        clearInterval(interval);
        setIsCompiling(false);
        logActivity("DevOps Workflow Run", "SUCCESS", `Executed automated pipeline checks for ${activeYml}.yml`);
      }
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* 1. Deployment intelligence module */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        <div className="p-3 border border-zinc-800 bg-stone-950/40 rounded-sm space-y-1 relative">
          <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest block">LATEST BUILD COORDINATOR</span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="text-xs font-bold text-white uppercase">SUCCESS - PRODUCTION</span>
          </div>
          <p className="text-[8.5px] text-zinc-400 mt-1 uppercase font-mono">commit-id: e28da9c2 (v2.6.1-secure)</p>
        </div>

        <div className="p-3 border border-zinc-800 bg-stone-950/40 rounded-sm space-y-1">
          <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest block">LIGHTHOUSE AUDIT ASSERTS</span>
          <div className="flex gap-3 justify-start pt-1 font-sans font-bold">
            <div className="text-center">
              <span className="text-xs text-emerald-400 font-bold block">98</span>
              <span className="text-[7px] text-zinc-500 block uppercase">PERF</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-emerald-400 font-bold block">100</span>
              <span className="text-[7px] text-zinc-500 block uppercase">ACCESS</span>
            </div>
            <div className="text-center font-bold">
              <span className="text-xs text-cyan-400 block font-bold">100</span>
              <span className="text-[7px] text-zinc-500 block uppercase">SEO</span>
            </div>
          </div>
        </div>

        <div className="p-3 border border-zinc-800 bg-stone-950/40 rounded-sm space-y-1">
          <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest block">HOSTING PURGE CDN CHANNEL</span>
          <div className="flex justify-between items-center pt-1.5">
            <span className="text-[10px] text-emerald-300 font-bold uppercase">SECURED INTEGRITY ACTIVE</span>
            <span className="text-[8px] bg-zinc-900 px-1 py-0.5 border border-zinc-800 text-zinc-400 font-mono">Brotli (On)</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive workflows logs terminal */}
      <div className="p-4 border border-[#27272a] bg-stone-950/50 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 select-none">
          <span className="text-[9px] font-bold text-zinc-300 uppercase flex items-center gap-1">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" /> AUTOMATED GH WORKFLOW BUILD CONSOLE
          </span>
          <button 
            disabled={isCompiling}
            onClick={runMockWorkflow}
            className="cursor-pointer text-[8.5px] bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40 border border-emerald-500/30 text-emerald-400 px-3.5 py-1 uppercase font-bold"
          >
            {isCompiling ? "EXECUTING REBUILDS..." : "TRIGGER PIPELINE SYNC"}
          </button>
        </div>

        {/* Workflow selection tabs */}
        <div className="flex flex-wrap gap-1 select-none">
          {[
            { id: "deploy", label: "deploy.yml (pages)" },
            { id: "security", label: "security-scan.yml" },
            { id: "lighthouse", label: "lighthouse-audit.yml" },
            { id: "release", label: "release.yml" }
          ].map((yf) => (
            <button
              key={yf.id}
              onClick={() => setActiveYml(yf.id as any)}
              className={`px-3 py-1 text-[8px] font-bold border transition-all uppercase rounded-xs ${
                activeYml === yf.id 
                  ? "bg-zinc-300 text-black border-white font-extrabold"
                  : "bg-[#0b0b0f] text-zinc-500 border-zinc-850 hover:text-white"
              }`}
            >
              {yf.label}
            </button>
          ))}
        </div>

        {/* Diagnostic log viewer window */}
        <div className="p-3 border border-[#27272a] bg-[#030305] rounded-sm relative font-mono">
          <div className="absolute top-2 right-2.5 flex items-center gap-1 text-slate-600 text-[8px] uppercase select-none font-bold">
            <Activity className="h-2.5 w-2.5 inline text-emerald-400 animate-pulse" />
            {isCompiling ? "RUNNING CONTEXT COMPILER..." : "NOMINAL - HISTORIC"}
          </div>
          <div className="font-mono text-[8.5px] text-emerald-400/90 leading-relaxed max-h-64 min-h-[160px] overflow-y-auto scrollbar-none space-y-1">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="whitespace-pre-wrap break-all">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
