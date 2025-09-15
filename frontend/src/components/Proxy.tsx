import {
  Box,
  Button,
  Flex,
  Heading,
  Tag,
  Text,
  useDisclosure,
  Accordion,
  IconButton,
  Menu,
  Dialog,
  Field,
  Input,
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import {
  FiPlus,
  FiMoreVertical,
  FiPlay,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { useState } from "react";
import React from "react";

// 简单模态框组件（参考 Rules.tsx）
interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, title, children, footer }) => {
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
      zIndex: 1000,
    }}>
      <Box 
        bg="bg" 
        color="fg" 
        borderRadius="md"
        boxShadow="lg"
        maxWidth="560px"
        width="100%"
      >
        <Flex justifyContent="space-between" alignItems="center" p={4} borderBottomWidth="1px">
          <Heading size="md">{title}</Heading>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </Flex>
        <Box p={4}>{children}</Box>
        <Flex justifyContent="flex-end" p={4} borderTopWidth="1px">
          {footer}
        </Flex>
      </Box>
    </div>
  );
};

// Mock data
const initialProxyGroups = [
  {
    id: "1",
    name: "Default Group",
    nodes: [
      {
        id: "101",
        name: "Node 1",
        type: "Shadowsocks",
        address: "127.0.0.1",
        port: 1080,
        latency: 120,
      },
      {
        id: "102",
        name: "Node 2",
        type: "Socks5",
        address: "example.com",
        port: 1081,
        latency: 250,
      },
    ],
  },
  {
    id: "2",
    name: "VIP Group",
    nodes: [
      {
        id: "201",
        name: "VIP Node 1",
        type: "HTTP",
        address: "vip.example.com",
        port: 8888,
        latency: 50,
      },
    ],
  },
];

const proxyTypeOptions = [
  { label: "Shadowsocks", value: "Shadowsocks" },
  { label: "Socks5", value: "Socks5" },
  { label: "HTTP", value: "HTTP" },
];

const proxyTypeCollection = createListCollection({
  items: proxyTypeOptions,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
});

interface ProxyNode {
  id: string;
  name: string;
  type: string;
  address: string;
  port: number;
  latency?: number;
}

export default function Proxy() {
  const { t } = useTranslation();
  const { open: isOpen, onOpen, onClose, setOpen: setDialogOpen } = useDisclosure();
  const {
    open: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
    setOpen: setDeleteOpen,
  } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const [proxyGroups, setProxyGroups] = useState(initialProxyGroups);
  const [currentNode, setCurrentNode] = useState<ProxyNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("Shadowsocks");
  const [address, setAddress] = useState("");
  const [port, setPort] = useState("");

  const handleEdit = (node: ProxyNode) => {
    setCurrentNode(node);
    setIsEditing(true);
    setName(node.name);
    setType(node.type);
    setAddress(node.address);
    setPort(node.port.toString());
    onOpen();
  };

  const handleTestSpeed = (id: string) => {
    // Show loading state
    const updatedGroups = proxyGroups.map((group) => ({
      ...group,
      nodes: group.nodes.map((node) =>
        node.id === id ? { ...node, latency: -1 } : node
      ),
    }));
    setProxyGroups(updatedGroups);

    // Simulate network delay
    setTimeout(() => {
      const randomLatency = Math.floor(Math.random() * 500) + 20; // 20ms to 520ms
      const finalGroups = proxyGroups.map((group) => ({
        ...group,
        nodes: group.nodes.map((node) =>
          node.id === id ? { ...node, latency: randomLatency } : node
        ),
      }));
      setProxyGroups(finalGroups);
    }, 1500);
  };

  const handleAdd = () => {
    setCurrentNode(null);
    setIsEditing(false);
    setName("");
    setType("Shadowsocks");
    setAddress("");
    setPort("");
    onOpen();
  };

  const handleDelete = (id: string) => {
    setNodeToDelete(id);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (nodeToDelete) {
      const updatedGroups = proxyGroups.map((group) => ({
        ...group,
        nodes: group.nodes.filter((node) => node.id !== nodeToDelete),
      }));
      setProxyGroups(updatedGroups);
      setNodeToDelete(null);
      onDeleteClose();
    }
  };

  const handleSave = () => {
    if (isEditing && currentNode) {
      // Update existing node
      const updatedGroups = proxyGroups.map((group) => ({
        ...group,
        nodes: group.nodes.map((node) =>
          node.id === currentNode.id
            ? { ...node, name, type, address, port: Number(port) }
            : node
        ),
      }));
      setProxyGroups(updatedGroups);
    } else {
      // Add new node to the first group for simplicity
      const newNode: ProxyNode = {
        id: new Date().getTime().toString(),
        name,
        type,
        address,
        port: Number(port),
      };
      const updatedGroups = [...proxyGroups];
      if (updatedGroups.length > 0) {
        updatedGroups[0].nodes.push(newNode as Required<ProxyNode>);
      } else {
        // If no groups exist, create one
        updatedGroups.push({
          id: "1",
          name: "Default Group",
          nodes: [newNode as Required<ProxyNode>],
        });
      }
      setProxyGroups(updatedGroups);
    }
    onClose();
  };

  const getLatencyColor = (latency: number | undefined) => {
    if (latency === undefined) return "gray";
    if (latency === -1) return "blue"; // Loading state
    if (latency < 100) return "green";
    if (latency < 300) return "yellow";
    return "red";
  };

  return (
    <Box flex={1} bg="bg" p={8} minH="100vh" color="fg">
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="lg">{t("menu.proxy")}</Heading>
        <Button colorScheme="brand" onClick={handleAdd}>
          <FiPlus style={{ marginRight: "var(--chakra-space-2)" }} />
          {t("proxy.add_proxy")}
        </Button>
      </Flex>

      <Accordion.Root multiple defaultValue={["1"]}>
        {proxyGroups.map((group) => (
          <Accordion.Item key={group.id} value={group.id} mb={4} border="none">
            <h2>
              <Accordion.ItemTrigger
                bg="bg-contrast"
                _hover={{ bg: "bg-contrast-hover" }}
                borderRadius="md"
              >
                <Box flex="1" textAlign="left">
                  {group.name} ({group.nodes.length})
                </Box>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
            </h2>
            <Accordion.ItemContent>
              {group.nodes.map((node) => (
                <Flex
                  key={node.id}
                  p={4}
                  mt={2}
                  bg="bg-contrast"
                  borderRadius="md"
                  justify="space-between"
                  align="center"
                  _hover={{ bg: "bg-contrast-hover" }}
                >
                  <Box>
                    <Text fontWeight="bold">{node.name}</Text>
                    <Text fontSize="sm" color="fg-muted">
                      {node.type} - {node.address}:{node.port}
                    </Text>
                  </Box>
                  <Flex align="center">
                    <Tag.Root
                      size="sm"
                      colorPalette={getLatencyColor(node.latency)}
                      mr={4}
                    >
                      <Tag.Label>
                        {node.latency !== undefined
                          ? node.latency === -1
                            ? t("proxy.testing")
                            : `${node.latency}ms`
                          : t("proxy.not_tested")}
                      </Tag.Label>
                    </Tag.Root>
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <IconButton variant="ghost" size="sm">
                          <FiMoreVertical />
                        </IconButton>
                      </Menu.Trigger>
                      <Portal>
                        <Menu.Positioner>
                          <Menu.Content>
                            <Menu.Item
                              value="test-speed"
                              onClick={() => handleTestSpeed(node.id)}
                            >
                              <FiPlay /> {t("proxy.test_speed")}
                            </Menu.Item>
                            <Menu.Item
                              value="edit"
                              onClick={() => handleEdit(node)}
                            >
                              <FiEdit /> {t("proxy.edit")}
                            </Menu.Item>
                            <Menu.Item
                              value="delete"
                              onClick={() => handleDelete(node.id)}
                              color="red.500"
                            >
                              <FiTrash2 /> {t("proxy.delete")}
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Positioner>
                      </Portal>
                    </Menu.Root>
                  </Flex>
                </Flex>
              ))}
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>

      {/* 删除确认依旧使用 Dialog */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={(details) => setDeleteOpen(details.open)}>
        <Portal>
          <Dialog.Content bg="bg-contrast">
            <Dialog.Header>
              {t("proxy.delete_proxy_title")}
            </Dialog.Header>
            <Dialog.Body>
              {t("proxy.delete_proxy_confirm")}
            </Dialog.Body>
            <Dialog.Footer>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                {t("common.cancel")}
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                {t("proxy.delete")}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Portal>
      </Dialog.Root>

      {/* 添加/编辑使用简单 Modal */}
      <SimpleModal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? t("proxy.edit_proxy") : t("proxy.add_proxy")}
        footer={
          <>
            <Button onClick={onClose} mr={3}>
              {t("common.cancel")}
            </Button>
            <Button colorScheme="brand" onClick={handleSave}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Field.Root>
            <Field.Label>{t("proxy.form.name")}</Field.Label>
            <Input
              placeholder={t("proxy.form.name_placeholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field.Root>
          <Field.Root style={{ marginTop: 16 }}>
            <Field.Label>{t("proxy.form.type")}</Field.Label>
            <Select.Root
              value={[type]}
              onValueChange={(details) => setType(details.value[0] ?? "")}
              collection={proxyTypeCollection}
            >
              <Select.Trigger>
                <Select.ValueText placeholder={t("proxy.form.type")} />
              </Select.Trigger>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {proxyTypeOptions.map((opt) => (
                      <Select.Item key={opt.value} item={opt}>
                        <Select.ItemText>{opt.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Field.Root>
          <Field.Root style={{ marginTop: 16 }}>
            <Field.Label>{t("proxy.form.address")}</Field.Label>
            <Input
              placeholder={t("proxy.form.address_placeholder")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field.Root>
          <Field.Root style={{ marginTop: 16 }}>
            <Field.Label>{t("proxy.form.port")}</Field.Label>
            <Input
              placeholder={t("proxy.form.port_placeholder")}
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </Field.Root>
        </form>
      </SimpleModal>
    </Box>
  );
}
