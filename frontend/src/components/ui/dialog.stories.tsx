import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogField,
  DialogFooter,
  DialogHeader,
  DialogImageUpload,
  DialogInput,
  DialogItemList,
  DialogLabel,
  DialogReadonlyField,
  DialogSummary,
  DialogTextarea,
  DialogTitle,
  DialogTrigger,
  type RequestItem,
} from "./dialog";
import { Button } from "./button";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

const categories: Record<string, string[]> = {
  스낵: ["과자", "쿠키", "파이", "초콜릿류", "캔디류", "껌류", "비스켓류", "씨리얼바", "젤리류", "견과류", "워터젤리"],
  음료: ["청량/탄산음료", "과즙음료", "에너지음료", "이온음료", "유산균음료", "건강음료", "차류", "두유/우유", "커피"],
  생수: ["생수", "스파클링"],
  간편식: ["봉지라면", "과일", "컵라면", "핫도그 및 소시지", "계란", "죽/스프류", "컵밥류", "시리얼", "반찬류", "면류", "요거트류", "가공안주류", "유제품"],
  신선식품: ["샐러드", "빵", "햄버거/샌드위치", "주먹밥/김밥", "도시락"],
  원두커피: ["드립커피", "원두", "캡슐커피"],
  비품: ["커피/차류", "생활용품", "일회용품", "사무용품", "카페용품", "일회용품(친환경)"],
};

const mainCategories = Object.keys(categories);

interface CategorySelectProps {
  selectedMain: string;
  selectedSub: string;
  onMainChange: (value: string) => void;
  onSubChange: (value: string) => void;
}

const CategorySelect = ({ selectedMain, selectedSub, onMainChange, onSubChange }: CategorySelectProps) => {
  const subCategories = selectedMain ? categories[selectedMain] || [] : [];

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <select
          value={selectedMain}
          onChange={(e) => {
            onMainChange(e.target.value);
            onSubChange("");
          }}
          className={`w-full h-[50px] px-4 pr-10 rounded-[12px] border border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:border-[#E5762C] focus:ring-1 focus:ring-[#E5762C] ${selectedMain ? "text-[#E5762C]" : "text-gray-400"}`}
        >
          <option value="">대분류</option>
          {mainCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-[#E5762C] pointer-events-none" />
      </div>
      <div className="relative flex-1">
        <select
          value={selectedSub}
          onChange={(e) => onSubChange(e.target.value)}
          className={`w-full h-[50px] px-4 pr-10 rounded-[12px] border border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:border-[#E5762C] focus:ring-1 focus:ring-[#E5762C] ${selectedSub ? "text-[#E5762C]" : "text-gray-400"}`}
        >
          <option value="">소분류</option>
          {subCategories.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-[#E5762C] pointer-events-none" />
      </div>
    </div>
  );
};

const AddItemModal = () => {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>상품 등록</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <DialogField>
          <DialogLabel>상품명</DialogLabel>
          <DialogInput placeholder="상품명을 입력해주세요." />
        </DialogField>

        <DialogField>
          <DialogLabel>카테고리</DialogLabel>
          <CategorySelect
            selectedMain={mainCategory}
            selectedSub={subCategory}
            onMainChange={setMainCategory}
            onSubChange={setSubCategory}
          />
        </DialogField>

        <DialogField>
          <DialogLabel>가격</DialogLabel>
          <DialogInput placeholder="가격을 입력해주세요." />
        </DialogField>

        <DialogField>
          <DialogLabel>상품 이미지</DialogLabel>
          <DialogImageUpload />
        </DialogField>

        <DialogField>
          <DialogLabel>제품링크</DialogLabel>
          <DialogInput placeholder="링크를 입력해주세요." />
        </DialogField>
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px]"
          >
            취소
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
          >
            등록하기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const AddItem: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="solid" size="sm">
          모달 열기
        </Button>
      </DialogTrigger>
      <AddItemModal />
    </Dialog>
  ),
};

interface EditItemModalProps {
  productName: string;
  categoryMain: string;
  categorySub: string;
  price: number;
  image?: string;
  productLink: string;
  onCancel?: () => void;
  onSubmit?: () => void;
}

const EditItemModal = ({
  productName,
  categoryMain: initialCategoryMain,
  categorySub: initialCategorySub,
  price,
  image,
  productLink,
  onCancel,
  onSubmit,
}: EditItemModalProps) => {
  const [mainCategory, setMainCategory] = useState(initialCategoryMain);
  const [subCategory, setSubCategory] = useState(initialCategorySub);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>상품 수정</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <DialogField>
          <DialogLabel>상품명</DialogLabel>
          <DialogInput defaultValue={productName} placeholder="상품명을 입력해주세요." />
        </DialogField>

        <DialogField>
          <DialogLabel>카테고리</DialogLabel>
          <CategorySelect
            selectedMain={mainCategory}
            selectedSub={subCategory}
            onMainChange={setMainCategory}
            onSubChange={setSubCategory}
          />
        </DialogField>

        <DialogField>
          <DialogLabel>가격</DialogLabel>
          <DialogInput defaultValue={price.toLocaleString()} placeholder="가격을 입력해주세요." />
        </DialogField>

        <DialogField>
          <DialogLabel>상품 이미지</DialogLabel>
          {image ? (
            <div className="w-[100px] h-[100px] rounded-[12px] overflow-hidden">
              <img src={image} alt="상품 이미지" className="w-full h-full object-cover" />
            </div>
          ) : (
            <DialogImageUpload />
          )}
        </DialogField>

        <DialogField>
          <DialogLabel>제품링크</DialogLabel>
          <DialogInput defaultValue={productLink} placeholder="링크를 입력해주세요." />
        </DialogField>
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onCancel}
          >
            취소
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onSubmit}
          >
            수정하기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const EditItem: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <EditItemModal
          productName="스프라이트 제로"
          categoryMain="음료"
          categorySub="청량/탄산음료"
          price={1900}
          image=""
          productLink="www.codeit"
        />
      </Dialog>
    );
  },
};

const sampleItems: RequestItem[] = [
  {
    id: "1",
    image: "",
    category: "청량 · 탄산음료",
    name: "코카콜라 제로",
    price: 2000,
    quantity: 4,
  },
  {
    id: "2",
    image: "",
    category: "청량 · 탄산음료",
    name: "코카콜라 제로",
    price: 2000,
    quantity: 4,
  },
  {
    id: "3",
    image: "",
    category: "청량 · 탄산음료",
    name: "펩시 제로",
    price: 1800,
    quantity: 2,
  },
  {
    id: "4",
    image: "",
    category: "과자 · 스낵",
    name: "프링글스 오리지널",
    price: 3500,
    quantity: 1,
  },
];

interface ItemRequestModalProps {
  requesterName: string;
  items: RequestItem[];
  onCancel?: () => void;
  onSubmit?: () => void;
}

const ItemRequestModal = ({ requesterName, items, onCancel, onSubmit }: ItemRequestModalProps) => {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>구매 요청</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <DialogField>
          <DialogLabel>요청인</DialogLabel>
          <DialogReadonlyField>{requesterName}</DialogReadonlyField>
        </DialogField>

        <DialogField>
          <DialogLabel>요청 품목</DialogLabel>
          <DialogItemList items={items} maxVisibleItems={2} />
        </DialogField>

        <DialogSummary totalCount={totalCount} totalPrice={totalPrice} />

        <DialogField>
          <DialogLabel>요청 메시지</DialogLabel>
          <DialogTextarea placeholder="요청 메시지를 입력해주세요." />
        </DialogField>
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onCancel}
          >
            취소
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onSubmit}
          >
            구매 요청하기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const ItemRequest: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <ItemRequestModal
          requesterName="김스낵"
          items={sampleItems}
        />
      </Dialog>
    );
  },
};

interface ItemAdmissionModalProps {
  requesterName: string;
  items: RequestItem[];
  onCancel?: () => void;
  onApprove?: () => void;
}

const ItemAdmissionModal = ({ requesterName, items, onCancel, onApprove }: ItemAdmissionModalProps) => {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>구매 요청 승인</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <DialogField>
          <DialogLabel>요청인</DialogLabel>
          <DialogReadonlyField>{requesterName}</DialogReadonlyField>
        </DialogField>

        <DialogField>
          <DialogLabel>요청 품목</DialogLabel>
          <DialogItemList items={items} maxVisibleItems={2} />
        </DialogField>

        <DialogSummary totalCount={totalCount} totalPrice={totalPrice} />

        <DialogField>
          <DialogLabel>요청 메시지</DialogLabel>
          <DialogTextarea placeholder="요청 메시지를 입력해주세요." />
        </DialogField>
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onCancel}
          >
            취소
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onApprove}
          >
            승인하기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const ItemAdmission: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <ItemAdmissionModal
          requesterName="김스낵"
          items={sampleItems}
        />
      </Dialog>
    );
  },
};

interface ItemInformationModalProps {
  image?: string;
  title: string;
  category: string;
  totalCount: number;
  totalPrice: number;
  message: string;
  onGoBack?: () => void;
  onViewHistory?: () => void;
}

const ItemInformationModal = ({
  image,
  title,
  category,
  totalCount,
  totalPrice,
  message,
  onGoBack,
  onViewHistory,
}: ItemInformationModalProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>상품정보</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <div className="rounded-[12px] border border-gray-200 p-4">
          <div className="flex gap-3">
            <div className="w-[70px] h-[70px] rounded-[8px] bg-gray-100 overflow-hidden flex-shrink-0">
              {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="text-xs text-gray-400 mt-1">{category}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center py-2">
          <p className="text-[24px] font-bold text-gray-900">총 {totalCount}개</p>
          <p className="text-xl font-bold text-[#E5762C]">{totalPrice.toLocaleString()}원</p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <DialogLabel>요청 메시지</DialogLabel>
          <div className="w-full min-h-[100px] px-4 py-3 rounded-[12px] border border-gray-200 bg-white text-sm text-gray-700 whitespace-pre-line">
            {message}
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onGoBack}
          >
            장바구니로 돌아가기
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onViewHistory}
          >
            요청 내역 확인하기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const ItemInformation: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <ItemInformationModal
          image=""
          title="코카콜라 제로 외 8개"
          category="청량 · 탄산음료"
          totalCount={9}
          totalPrice={43000}
          message={`코카콜라 제로 인기가 많아요.\n많이 주문하면 좋을 것 같아요!`}
        />
      </Dialog>
    );
  },
};

const roles = ["유저", "관리자", "최고 관리자"];

const InviteMemberModal = () => {
  const [selectedRole, setSelectedRole] = useState("");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>회원 초대</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <DialogField>
          <DialogLabel>이름</DialogLabel>
          <DialogInput placeholder="이름을 입력해주세요" />
        </DialogField>

        <DialogField>
          <DialogLabel>이메일</DialogLabel>
          <DialogInput placeholder="이메일을 입력해주세요" />
        </DialogField>

        <DialogField>
          <DialogLabel>권한</DialogLabel>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className={`w-full h-[50px] px-4 pr-10 rounded-[12px] border border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:border-[#E5762C] focus:ring-1 focus:ring-[#E5762C] ${selectedRole ? "text-gray-900" : "text-gray-400"}`}
            >
              <option value="">권한을 선택해주세요</option>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-[#E5762C] pointer-events-none" />
          </div>
        </DialogField>
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px]"
          >
            취소
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
          >
            등록하기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const InviteMember: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <InviteMemberModal />
      </Dialog>
    );
  },
};

interface EditMemberRoleModalProps {
  name: string;
  email: string;
  currentRole: string;
  onCancel?: () => void;
  onSubmit?: () => void;
}

const EditMemberRoleModal = ({
  name,
  email,
  currentRole,
  onCancel,
  onSubmit,
}: EditMemberRoleModalProps) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>회원 권한 변경</DialogTitle>
      </DialogHeader>

      <DialogBody>
        <DialogField>
          <DialogLabel>이름</DialogLabel>
          <DialogReadonlyField>{name}</DialogReadonlyField>
        </DialogField>

        <DialogField>
          <DialogLabel>이메일</DialogLabel>
          <DialogReadonlyField>{email}</DialogReadonlyField>
        </DialogField>

        <DialogField>
          <DialogLabel>권한</DialogLabel>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className={`w-full h-[50px] px-4 pr-10 rounded-[12px] border border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:border-[#E5762C] focus:ring-1 focus:ring-[#E5762C] ${selectedRole ? "text-gray-900" : "text-gray-400"}`}
            >
              <option value="">권한을 선택해주세요</option>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-[#E5762C] pointer-events-none" />
          </div>
        </DialogField>
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onCancel}
          >
            취소
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onSubmit}
          >
            변경하기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const EditMemberRole: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <EditMemberRoleModal
          name="김스낵"
          email="sn@codeit.com"
          currentRole="관리자"
        />
      </Dialog>
    );
  },
};

interface DeleteItemModalProps {
  productName: string;
  onCancel?: () => void;
  onDelete?: () => void;
}

const DeleteItemModal = ({
  productName,
  onCancel,
  onDelete,
}: DeleteItemModalProps) => {
  return (
    <DialogContent className="max-w-[400px] text-center">
      <div className="flex flex-col items-center pt-4">
        <img
          src="/assets/puppyworng.svg"
          alt="삭제 확인"
          className="w-[120px] h-[120px] mb-4"
        />
        
        <h2 className="text-xl font-bold text-gray-900 mb-3">상품 삭제</h2>
        
        <p className="text-sm text-gray-600 mb-1">
          <span className="text-[#E5762C] font-medium">{productName}</span> 상품을 삭제할까요?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          상품 삭제 후에는 복구할 수 없어요!
        </p>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px] bg-[#FDF0DF] border-[#FDF0DF] hover:bg-[#fce8cf]"
            onClick={onCancel}
          >
            더 생각해볼게요
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onDelete}
          >
            삭제할래요
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const DeleteItem: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <DeleteItemModal productName="코카콜라" />
      </Dialog>
    );
  },
};

interface DeleteAccountModalProps {
  name: string;
  email: string;
  onCancel?: () => void;
  onDelete?: () => void;
}

const DeleteAccountModal = ({
  name,
  email,
  onCancel,
  onDelete,
}: DeleteAccountModalProps) => {
  return (
    <DialogContent className="max-w-[400px] text-center">
      <div className="flex flex-col items-center pt-4">
        <img
          src="/assets/puppyworng.svg"
          alt="계정 탈퇴"
          className="w-[120px] h-[120px] mb-4"
        />
        
        <h2 className="text-xl font-bold text-gray-900 mb-3">계정 탈퇴</h2>
        
        <p className="text-sm text-gray-600 mb-6">
          {name}(<span className="text-[#E5762C]">{email}</span>)님의 계정을 탈퇴시킬까요?
        </p>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px] bg-[#FDF0DF] border-[#FDF0DF] hover:bg-[#fce8cf]"
            onClick={onCancel}
          >
            더 생각해볼게요
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onDelete}
          >
            탈퇴시키기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const DeleteAccount: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <DeleteAccountModal
          name="김스낵"
          email="sn@codeit.com"
        />
      </Dialog>
    );
  },
};

interface CancelRequestModalProps {
  productName: string;
  additionalCount: number;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const CancelRequestModal = ({
  productName,
  additionalCount,
  onCancel,
  onConfirm,
}: CancelRequestModalProps) => {
  return (
    <DialogContent className="max-w-[400px] text-center">
      <div className="flex flex-col items-center pt-4">
        <img
          src="/assets/puppyworng.svg"
          alt="구매 요청 취소"
          className="w-[120px] h-[120px] mb-4"
        />
        
        <h2 className="text-xl font-bold text-gray-900 mb-3">구매 요청 취소</h2>
        
        <p className="text-sm text-gray-600 mb-1">
          <span className="text-[#E5762C] font-medium">{productName} 외 {additionalCount}건</span> 구매 요청을 취소하시겠어요?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          구매 요청 취소 후에는 복구할 수 없어요!
        </p>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px] bg-[#FDF0DF] border-[#FDF0DF] hover:bg-[#fce8cf]"
            onClick={onCancel}
          >
            더 생각해볼게요
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onConfirm}
          >
            취소할래요
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const CancelRequest: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <CancelRequestModal
          productName="코카콜라"
          additionalCount={1}
        />
      </Dialog>
    );
  },
};

interface ApprovalCompleteModalProps {
  onGoHome?: () => void;
  onViewHistory?: () => void;
}

const ApprovalCompleteModal = ({
  onGoHome,
  onViewHistory,
}: ApprovalCompleteModalProps) => {
  return (
    <DialogContent className="max-w-[400px] text-center">
      <div className="flex flex-col items-center pt-4">
        <img
          src="/assets/puppyasign.svg"
          alt="승인 완료"
          className="w-[120px] h-[120px] mb-4"
        />
        
        <h2 className="text-xl font-bold text-gray-900 mb-3">승인 완료</h2>
        
        <p className="text-sm text-gray-600 mb-1">
          승인이 완료되었어요!
        </p>
        <p className="text-sm text-gray-500 mb-6">
          구매 내역을 통해 배송현황을 확인해보세요
        </p>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onGoHome}
          >
            홈으로
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onViewHistory}
          >
            구매 내역 보기
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const ApprovalComplete: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <ApprovalCompleteModal />
      </Dialog>
    );
  },
};

interface RequestRejectedModalProps {
  onGoHome?: () => void;
  onViewList?: () => void;
}

const RequestRejectedModal = ({
  onGoHome,
  onViewList,
}: RequestRejectedModalProps) => {
  return (
    <DialogContent className="max-w-[400px] text-center">
      <div className="flex flex-col items-center pt-4">
        <img
          src="/assets/puppy3.svg"
          alt="요청 반려"
          className="w-[120px] h-[120px] mb-4"
        />
        
        <h2 className="text-xl font-bold text-gray-900 mb-3">요청 반려</h2>
        
        <p className="text-sm text-gray-600 mb-1">
          요청이 반려되었어요
        </p>
        <p className="text-sm text-gray-500 mb-6">
          목록에서 다른 요청을 확인해보세요
        </p>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outlined"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onGoHome}
          >
            홈으로
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px]"
            onClick={onViewList}
          >
            구매 요청 목록
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const RequestRejected: Story = {
  render: () => {
    return (
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="solid" size="sm">
            모달 열기
          </Button>
        </DialogTrigger>
        <RequestRejectedModal />
      </Dialog>
    );
  },
};
