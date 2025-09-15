import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  Badge,
  Spinner,
  IconButton,
  VStack
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaSearch, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toaster } from "@/components/ui/toaster";
import { Switch } from "@/components/ui/switch";

// Rule 类型定义
interface Rule {
  id: string;
  name: string;
  type: string;
  pattern: string;
  target: string;
  active: boolean;
  priority: number;
}

// StatCard 组件
interface StatCardProps {
  title: string;
  value: string;
}

const StatCard = ({ title, value }: StatCardProps) => {
  return (
    <Box p={4} bg="bg.subtle" borderRadius="md" borderWidth="1px" borderColor="border.subtle">
      <Text fontSize="sm" color="fg.muted">{title}</Text>
      <Text fontSize="2xl" fontWeight="bold" mt={2}>{value}</Text>
    </Box>
  );
};

// 简单模态框组件
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <Box 
        bg="bg" 
        color="fg" 
        borderRadius="md"
        boxShadow="lg"
        maxWidth="500px"
        width="100%"
      >
        <Flex justifyContent="space-between" alignItems="center" p={4} borderBottomWidth="1px">
          <Heading size="md">{title}</Heading>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </Flex>
        
        <Box p={4}>
          {children}
        </Box>
        
        <Flex justifyContent="flex-end" p={4} borderTopWidth="1px">
          {footer}
        </Flex>
      </Box>
    </div>
  );
};

export default function Rules() {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // 状态
  const [rules, setRules] = useState<Rule[]>([]);
  const [filteredRules, setFilteredRules] = useState<Rule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [newRule, setNewRule] = useState<Omit<Rule, "id">>({
    name: "",
    type: "DOMAIN",
    pattern: "",
    target: "DIRECT",
    active: true,
    priority: 0
  });
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // 模拟数据加载
  useEffect(() => {
    setIsLoading(true);
    // 模拟API调用延迟
    setTimeout(() => {
      const mockRules: Rule[] = [
        { id: "1", name: "Block Ads", type: "DOMAIN", pattern: "*.ads.*", target: "REJECT", active: true, priority: 10 },
        { id: "2", name: "Social Media", type: "DOMAIN", pattern: "*.facebook.com", target: "PROXY", active: false, priority: 5 },
        { id: "3", name: "Local Network", type: "IP", pattern: "192.168.1.0/24", target: "DIRECT", active: true, priority: 20 },
        { id: "4", name: "Gaming", type: "PORT", pattern: "27015-27030", target: "GAME", active: true, priority: 15 },
        { id: "5", name: "Video Streaming", type: "DOMAIN", pattern: "*.netflix.com", target: "PROXY", active: true, priority: 8 },
      ];
      setRules(mockRules);
      setFilteredRules(mockRules);
      setIsLoading(false);
    }, 500);
  }, []);

  // 过滤规则
  useEffect(() => {
    let filtered = rules;
    
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rule => 
        rule.name.toLowerCase().includes(query) || 
        rule.pattern.toLowerCase().includes(query)
      );
    }
    
    // 类型过滤
    if (typeFilter !== "ALL") {
      filtered = filtered.filter(rule => rule.type === typeFilter);
    }
    
    // 状态过滤
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(rule => 
        (statusFilter === "ACTIVE" ? rule.active : !rule.active)
      );
    }
    
    setFilteredRules(filtered);
  }, [searchQuery, typeFilter, statusFilter, rules]);

  // 打开编辑模态框
  const handleEdit = (rule: Rule) => {
    setSelectedRule(rule);
    setNewRule({
      name: rule.name,
      type: rule.type,
      pattern: rule.pattern,
      target: rule.target,
      active: rule.active,
      priority: rule.priority
    });
    setIsEditOpen(true);
  };

  // 打开删除模态框
  const handleDelete = (rule: Rule) => {
    setSelectedRule(rule);
    setIsDeleteOpen(true);
  };

  // 保存新规则
  const handleSaveNewRule = () => {
    // 这里可以添加表单验证逻辑
    const id = (Math.max(...rules.map(r => parseInt(r.id)), 0) + 1).toString();
    const rule = { id, ...newRule };
    
    setRules(prev => [...prev, rule]);
    toaster.create({
      title: t("rules.rule_created"),
      type: "success",
      duration: 2000,
    });
    
    // 重置表单并关闭
    setNewRule({
      name: "",
      type: "DOMAIN",
      pattern: "",
      target: "DIRECT",
      active: true,
      priority: 0
    });
    setIsAddOpen(false);
  };

  // 更新规则
  const handleUpdateRule = () => {
    if (!selectedRule) return;
    
    setRules(prev => prev.map(rule => 
      rule.id === selectedRule.id ? { ...rule, ...newRule } : rule
    ));
    
    toaster.create({
      title: t("rules.rule_updated"),
      type: "success",
      duration: 2000,
    });
    
    setIsEditOpen(false);
  };

  // 删除规则
  const handleConfirmDelete = () => {
    if (!selectedRule) return;
    
    setRules(prev => prev.filter(rule => rule.id !== selectedRule.id));
    
    toaster.create({
      title: t("rules.rule_deleted"),
      type: "success",
      duration: 2000,
    });
    
    setIsDeleteOpen(false);
  };

  // 处理表单输入变化
  const handleInputChange = (field: keyof Omit<Rule, "id">, value: string | boolean | number) => {
    setNewRule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 规则状态徽章
  const StatusBadge = ({ active }: { active: boolean }) => (
    <Badge colorScheme={active ? "green" : "gray"}>
      {active ? t("rules.status_active") : t("rules.status_inactive")}
    </Badge>
  );

  return (
    <Box flex="1" bg="bg" p={8} minH="100vh">
      {/* 标题栏 */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading color="fg">{t("rules.title")}</Heading>
        <Button onClick={() => setIsAddOpen(true)} colorScheme="blue">
          <Box as={FaPlus} mr={2} />
          {t("rules.add_rule")}
        </Button>
      </Flex>

      {/* 统计卡片 */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={6}>
        <StatCard 
          title={t("rules.total_rules")} 
          value={rules.length.toString()} 
        />
        <StatCard 
          title={t("rules.active_rules")} 
          value={rules.filter(r => r.active).length.toString()} 
        />
      </SimpleGrid>

      {/* 搜索和过滤 */}
      <Box bg="bg.subtle" borderRadius="md" p={4} mb={6} border="1px solid" borderColor="border.subtle">
        <Flex direction={{ base: "column", md: "row" }} gap={4}>
          <Box position="relative" flex="1">
            <Input 
              placeholder={t("rules.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ps="2.5rem"
            />
            <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="fg.muted">
              <FaSearch />
            </Box>
          </Box>
          <HStack gap={4}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: "150px", padding: "8px" }}
            >
              <option value="ALL">{t("rules.filter_all")}</option>
              <option value="DOMAIN">{t("rules.filter_domain")}</option>
              <option value="IP">{t("rules.filter_ip")}</option>
              <option value="PORT">{t("rules.filter_port")}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "150px", padding: "8px" }}
            >
              <option value="ALL">{t("rules.filter_all")}</option>
              <option value="ACTIVE">{t("rules.filter_active")}</option>
              <option value="INACTIVE">{t("rules.filter_inactive")}</option>
            </select>
          </HStack>
        </Flex>
      </Box>

      {/* 规则表格 */}
      <Box bg="bg.subtle" borderRadius="md" borderWidth="1px" borderColor="border.subtle" overflow="hidden">
        {isLoading ? (
          <Flex justify="center" align="center" py={8}>
            <Spinner size="md" />
          </Flex>
        ) : filteredRules.length === 0 ? (
          <Text p={8} textAlign="center">{t("rules.no_rules")}</Text>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "var(--bg-subtle)" }}>
              <tr>
                <th style={{ textAlign: "left", padding: "8px" }}>{t("rules.rule_name")}</th>
                <th style={{ textAlign: "left", padding: "8px" }}>{t("rules.rule_type")}</th>
                <th style={{ textAlign: "left", padding: "8px" }}>{t("rules.rule_pattern")}</th>
                <th style={{ textAlign: "left", padding: "8px" }}>{t("rules.rule_target")}</th>
                <th style={{ textAlign: "left", padding: "8px" }}>{t("rules.rule_priority")}</th>
                <th style={{ textAlign: "left", padding: "8px" }}>{t("rules.rule_status")}</th>
                <th style={{ textAlign: "left", padding: "8px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "8px" }}>{rule.name}</td>
                  <td style={{ padding: "8px" }}>{rule.type}</td>
                  <td style={{ padding: "8px" }}>{rule.pattern}</td>
                  <td style={{ padding: "8px" }}>{rule.target}</td>
                  <td style={{ padding: "8px" }}>{rule.priority}</td>
                  <td style={{ padding: "8px" }}><StatusBadge active={rule.active} /></td>
                  <td style={{ padding: "8px" }}>
                    <HStack gap={2}>
                      <IconButton
                        aria-label={t("rules.edit_rule")}
                        onClick={() => handleEdit(rule)}
                        size="sm"
                        variant="ghost"
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        aria-label={t("rules.delete_rule")}
                        onClick={() => handleDelete(rule)}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                      >
                        <FaTrash />
                      </IconButton>
                    </HStack>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>

      {/* 添加规则模态框 */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t("rules.add_rule")}
        footer={
          <>
            <Button variant="outline" mr={3} onClick={() => setIsAddOpen(false)}>
              {t("rules.cancel")}
            </Button>
            <Button colorScheme="blue" onClick={handleSaveNewRule}>
              {t("rules.save")}
            </Button>
          </>
        }
      >
        <VStack gap={4} align="stretch">
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_name")}</Text>
            <Input 
              value={newRule.name} 
              onChange={(e) => handleInputChange("name", e.target.value)} 
            />
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_type")}</Text>
            <select
              value={newRule.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="DOMAIN">{t("rules.filter_domain")}</option>
              <option value="IP">{t("rules.filter_ip")}</option>
              <option value="PORT">{t("rules.filter_port")}</option>
            </select>
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_pattern")}</Text>
            <Input 
              value={newRule.pattern} 
              onChange={(e) => handleInputChange("pattern", e.target.value)} 
            />
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_target")}</Text>
            <select
              value={newRule.target}
              onChange={(e) => handleInputChange("target", e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="DIRECT">DIRECT</option>
              <option value="PROXY">PROXY</option>
              <option value="REJECT">REJECT</option>
              <option value="GAME">GAME</option>
            </select>
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_priority")}</Text>
            <Input 
              type="number"
              value={newRule.priority} 
              onChange={(e) => handleInputChange("priority", parseInt(e.target.value) || 0)} 
            />
          </Box>
          
          <Flex align="center" justify="space-between">
            <Text fontWeight="medium">
              {t("rules.rule_status")}
            </Text>
            <Switch 
              checked={newRule.active}
              onCheckedChange={(e) => handleInputChange("active", e.checked)}
              colorPalette="blue"
            />
          </Flex>
        </VStack>
      </Modal>

      {/* 编辑规则模态框 */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={t("rules.edit_rule")}
        footer={
          <>
            <Button variant="outline" mr={3} onClick={() => setIsEditOpen(false)}>
              {t("rules.cancel")}
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateRule}>
              {t("rules.save")}
            </Button>
          </>
        }
      >
        <VStack gap={4} align="stretch">
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_name")}</Text>
            <Input 
              value={newRule.name} 
              onChange={(e) => handleInputChange("name", e.target.value)} 
            />
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_type")}</Text>
            <select
              value={newRule.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="DOMAIN">{t("rules.filter_domain")}</option>
              <option value="IP">{t("rules.filter_ip")}</option>
              <option value="PORT">{t("rules.filter_port")}</option>
            </select>
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_pattern")}</Text>
            <Input 
              value={newRule.pattern} 
              onChange={(e) => handleInputChange("pattern", e.target.value)} 
            />
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_target")}</Text>
            <select
              value={newRule.target}
              onChange={(e) => handleInputChange("target", e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="DIRECT">DIRECT</option>
              <option value="PROXY">PROXY</option>
              <option value="REJECT">REJECT</option>
              <option value="GAME">GAME</option>
            </select>
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">{t("rules.rule_priority")}</Text>
            <Input 
              type="number"
              value={newRule.priority} 
              onChange={(e) => handleInputChange("priority", parseInt(e.target.value) || 0)} 
            />
          </Box>
          
          <Flex align="center" justify="space-between">
            <Text fontWeight="medium">
              {t("rules.rule_status")}
            </Text>
            <Switch 
              checked={newRule.active}
              onCheckedChange={(e) => handleInputChange("active", e.checked)}
              colorPalette="blue"
            />
          </Flex>
        </VStack>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={t("rules.delete_rule")}
        footer={
          <>
            <Button variant="outline" mr={3} onClick={() => setIsDeleteOpen(false)}>
              {t("rules.cancel")}
            </Button>
            <Button colorScheme="red" onClick={handleConfirmDelete}>
              {t("rules.delete_rule")}
            </Button>
          </>
        }
      >
        <VStack gap={4} align="stretch">
          <Text>{t("rules.confirm_delete")}</Text>
          {selectedRule && (
            <Box mt={4} p={4} bg="bg.subtle" borderRadius="md">
              <Text fontWeight="bold">{selectedRule.name}</Text>
              <Text>{selectedRule.pattern}</Text>
            </Box>
          )}
        </VStack>
      </Modal>
    </Box>
  );
}